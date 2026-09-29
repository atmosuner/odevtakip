// POST   /api/ebeveyn — ikinci ebeveyni davet eder
// DELETE /api/ebeveyn?ebeveynId=… — ebeveyni haneden çıkarır
//
// Davet, giriş akışının üstüne biniyor: davet edilen kişi e-postasına gelen
// bağlantıyla giriş yapar ve doğrudan bu haneye bağlanır. Ayrı bir "daveti
// kabul et" ekranı yok — ebeveynler eşit yetkili olduğu için gereksiz adım.

import type { Config, Context } from '@netlify/functions';
import { yetkiAl } from '../../src/server/oturum';
import {
  biletUret, biletOzeti, epostaAnahtari, kimlikUret,
} from '../../src/server/kripto';
import {
  davet, haneYapisi, epostaKaydi, girisBileti, depo,
} from '../../src/server/db';
import { girisBaglantisi } from '../../src/server/adres';
import { girisBaglantisiGonder } from '../../src/server/eposta';
import { SEMA_SURUMU, anahtar } from '../../src/server/sema';
import { json, hata, yetkisiz, yanlisYontem, icHata } from '../../src/server/yanit';

const DAVET_OMRU_MS = 7 * 86_400_000;
const EPOSTA_BICIMI = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EN_FAZLA_EBEVEYN = 4;

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  try {
    const yetki = await yetkiAl(istek);
    if (!yetki) return yetkisiz();

    if (istek.method === 'POST') return await davetEt(istek, yetki.hane.id);
    if (istek.method === 'DELETE') return await cikar(istek, yetki);
    return yanlisYontem();
  } catch (e) {
    return icHata(e, 'ebeveyn');
  }
};

async function davetEt(istek: Request, haneId: string): Promise<Response> {
  const govde = await istek.json().catch(() => null) as { eposta?: unknown } | null;
  const eposta = typeof govde?.eposta === 'string' ? govde.eposta.trim() : '';

  if (!EPOSTA_BICIMI.test(eposta) || eposta.length > 254) {
    return hata(400, 'Geçerli bir e-posta adresi girin', 'eposta-bicimi');
  }

  const kayit = await haneYapisi.oku(haneId);
  if (!kayit) return hata(404, 'Hane bulunamadı', 'yok');

  if (kayit.deger.ebeveynler.length >= EN_FAZLA_EBEVEYN) {
    return hata(400, `En fazla ${EN_FAZLA_EBEVEYN} ebeveyn olabilir`, 'dolu');
  }
  if (kayit.deger.ebeveynler.some((e) => e.eposta.toLowerCase() === eposta.toLowerCase())) {
    return hata(400, 'Bu kişi zaten hanede', 'zaten-uye');
  }

  const anahtarAdi = epostaAnahtari(eposta);
  const mevcut = await epostaKaydi.oku(anahtarAdi);
  if (mevcut) {
    // Bu adres başka bir haneye bağlı. Hangi haneye bağlı olduğunu
    // söylemiyoruz — davet eden kişinin bilmesi gereken bir şey değil.
    return hata(400, 'Bu e-posta başka bir hanede kullanılıyor', 'baska-hane');
  }

  const ebeveynId = kimlikUret();
  const simdi = Date.now();

  // Ebeveyn şimdi eklenir; giriş yaptığında hane hazır olur.
  const guncel = await haneYapisi.guncelle(haneId, (m) => m && ({
    ...m,
    ebeveynler: [...m.ebeveynler, {
      id: ebeveynId, eposta, ad: eposta.split('@')[0] ?? '',
      katilmaUtc: simdi, sonGirisUtc: null,
    }],
  }));
  if (!guncel) return hata(409, 'Davet oluşturulamadı', 'cakisma');

  await epostaKaydi.olustur(anahtarAdi, { sema: SEMA_SURUMU, ebeveynId, haneId });

  // Davet kaydı iz için; giriş bileti asıl işi yapıyor.
  const izBileti = biletUret();
  await davet.olustur(biletOzeti(izBileti), {
    sema: SEMA_SURUMU, tur: 'ebeveyn-davet', haneId,
    cocukId: null, eposta,
    olusturmaUtc: simdi, sonKullanmaUtc: simdi + DAVET_OMRU_MS, kullanildiUtc: null,
  });

  const girisBilet = biletUret();
  await girisBileti.olustur(biletOzeti(girisBilet), {
    sema: SEMA_SURUMU, eposta, haneId, ebeveynId,
    olusturmaUtc: simdi,
    sonKullanmaUtc: simdi + DAVET_OMRU_MS,
    kullanildiUtc: null,
  });

  await girisBaglantisiGonder(eposta, girisBaglantisi(istek, girisBilet));

  return json({ davetEdildi: true, eposta });
}

async function cikar(
  istek: Request,
  yetki: { hane: { id: string }; oturum: { ebeveynId: string } },
): Promise<Response> {
  const ebeveynId = new URL(istek.url).searchParams.get('ebeveynId');
  if (!ebeveynId) return hata(400, 'ebeveynId gerekli', 'eksik');

  // Kendini çıkarmak çıkış yapmak demek değil; kafa karışıklığı yaratır
  // ve haneyi sahipsiz bırakabilir.
  if (ebeveynId === yetki.oturum.ebeveynId) {
    return hata(400, 'Kendinizi çıkaramazsınız', 'kendisi');
  }

  // Çıkarılacak ebeveynin e-postası, güncellemeden önce okunur: güncelleme
  // kapanışı çakışmada yeniden çalıştığı için yan etki bırakmamalı.
  const oncesi = await haneYapisi.oku(yetki.hane.id);
  if (!oncesi) return hata(404, 'Hane bulunamadı', 'yok');

  const hedef = oncesi.deger.ebeveynler.find((e) => e.id === ebeveynId);
  if (!hedef) return hata(404, 'Ebeveyn bulunamadı', 'yok');
  if (oncesi.deger.ebeveynler.length <= 1) {
    return hata(400, 'Hanedeki son ebeveyn çıkarılamaz', 'son-ebeveyn');
  }

  const guncel = await haneYapisi.guncelle(yetki.hane.id, (m) => {
    if (!m) return null;
    if (m.ebeveynler.length <= 1) return m;   // yarışta son ebeveyn kaldıysa dokunma
    return { ...m, ebeveynler: m.ebeveynler.filter((e) => e.id !== ebeveynId) };
  });
  if (!guncel) return hata(409, 'Ebeveyn çıkarılamadı', 'cakisma');
  if (guncel.ebeveynler.some((e) => e.id === ebeveynId)) {
    return hata(400, 'Hanedeki son ebeveyn çıkarılamaz', 'son-ebeveyn');
  }

  // E-posta kaydı da silinmeli, yoksa adres başka haneye eklenemez.
  await depo().delete(anahtar.eposta(epostaAnahtari(hedef.eposta)))
    .catch((e) => console.warn('[ebeveyn] eposta kaydı silinemedi:', e));

  return json({ cikarildi: true });
}

export const config: Config = { path: '/api/ebeveyn' };
