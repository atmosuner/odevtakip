// POST   /api/cocuk — çocuk ekler ve bağlama daveti üretir
// POST   /api/cocuk (cocukId ile) — mevcut çocuk için yeni davet (yeniden bağlama)
// DELETE /api/cocuk?cocukId=… — çocuğu ve verisini siler
//
// Davet bileti kısa ömürlü: QR koda gömülen adres saatlerce geçerli kalmamalı,
// ekran görüntüsü paylaşılırsa başkası çocuğun hesabını bağlayamasın.

import type { Config, Context } from '@netlify/functions';
import { yetkiAl } from '../../src/server/oturum';
import { biletUret, biletOzeti, kimlikUret } from '../../src/server/kripto';
import { davet, haneYapisi, depo } from '../../src/server/db';
import { baglantiDaveti } from '../../src/server/adres';
import { SEMA_SURUMU, anahtar, type Cocuk } from '../../src/server/sema';
import { json, hata, yetkisiz, yanlisYontem, icHata } from '../../src/server/yanit';

const DAVET_OMRU_MS = 30 * 60_000;
const AD_EN_FAZLA = 40;
const SINIF_EN_FAZLA = 30;
const EN_FAZLA_COCUK = 6;      // --cocuk-1..6 renk paleti kadar

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  try {
    const yetki = await yetkiAl(istek);
    if (!yetki) return yetkisiz();

    if (istek.method === 'POST') return await ekleVeyaYenidenBagla(istek, yetki.hane.id);
    if (istek.method === 'DELETE') return await sil(istek, yetki.hane.id);
    return yanlisYontem();
  } catch (e) {
    return icHata(e, 'cocuk');
  }
};

async function ekleVeyaYenidenBagla(istek: Request, haneId: string): Promise<Response> {
  const govde = await istek.json().catch(() => null) as
    { ad?: unknown; sinif?: unknown; cocukId?: unknown } | null;

  // Mevcut çocuk için yeni davet — bağlantı koptuğunda kullanılır.
  if (typeof govde?.cocukId === 'string') {
    const kayit = await haneYapisi.oku(haneId);
    const cocuk = kayit?.deger.cocuklar.find((c) => c.id === govde.cocukId);
    if (!cocuk) return hata(404, 'Çocuk bulunamadı', 'yok');
    return json(await davetUret(istek, haneId, cocuk.id, cocuk.ad));
  }

  const ad = typeof govde?.ad === 'string' ? govde.ad.trim() : '';
  const sinif = typeof govde?.sinif === 'string' ? govde.sinif.trim() : '';

  if (!ad) return hata(400, 'Çocuğun adı gerekli', 'ad-bos');
  if (ad.length > AD_EN_FAZLA) {
    return hata(400, `Ad en fazla ${AD_EN_FAZLA} karakter olabilir`, 'ad-uzun');
  }
  if (sinif.length > SINIF_EN_FAZLA) {
    return hata(400, `Sınıf en fazla ${SINIF_EN_FAZLA} karakter olabilir`, 'sinif-uzun');
  }

  const cocukId = kimlikUret();
  const yeni: Cocuk = {
    id: cocukId, ad, sinif,
    eklenmeUtc: Date.now(),
    baglanti: 'bekliyor',
    kopmaSebebi: null, kopmaUtc: null,
    tokenSifreli: null, googleKullaniciId: null,
    ilkTaramaUtc: null, sonTaramaUtc: null,
  };

  let doluMu = false;
  const guncel = await haneYapisi.guncelle(haneId, (m) => {
    if (!m) return null;
    if (m.cocuklar.length >= EN_FAZLA_COCUK) { doluMu = true; return m; }
    return { ...m, cocuklar: [...m.cocuklar, yeni] };
  });

  if (doluMu) {
    return hata(400, `En fazla ${EN_FAZLA_COCUK} çocuk eklenebilir`, 'dolu');
  }
  if (!guncel) return hata(409, 'Çocuk eklenemedi', 'cakisma');

  return json({ cocukId, ...(await davetUret(istek, haneId, cocukId, ad)) });
}

async function davetUret(istek: Request, haneId: string, cocukId: string, cocukAdi: string) {
  const bilet = biletUret();
  const sonKullanmaUtc = Date.now() + DAVET_OMRU_MS;

  await davet.olustur(biletOzeti(bilet), {
    sema: SEMA_SURUMU,
    tur: 'cocuk-bagla',
    haneId, cocukId,
    eposta: null,
    olusturmaUtc: Date.now(),
    sonKullanmaUtc,
    kullanildiUtc: null,
  });

  return { cocukAdi, davetAdresi: baglantiDaveti(istek, bilet), sonKullanmaUtc };
}

async function sil(istek: Request, haneId: string): Promise<Response> {
  const cocukId = new URL(istek.url).searchParams.get('cocukId');
  if (!cocukId) return hata(400, 'cocukId gerekli', 'eksik');

  let bulundu = false;
  const guncel = await haneYapisi.guncelle(haneId, (m) => {
    if (!m) return null;
    bulundu = m.cocuklar.some((c) => c.id === cocukId);
    if (!bulundu) return m;
    return { ...m, cocuklar: m.cocuklar.filter((c) => c.id !== cocukId) };
  });

  if (!guncel) return hata(409, 'Çocuk silinemedi', 'cakisma');
  if (!bulundu) return hata(404, 'Çocuk bulunamadı', 'yok');

  // Veri ve geçmiş de gider. Kullanıcı bunu onay ekranında görüyor:
  // "bağlantıyı kaldır" yıkıcı bir işlem olarak sunuluyor.
  await Promise.all([
    depo().delete(anahtar.cocukVerisi(haneId, cocukId)).catch(bildir('veri')),
    depo().delete(anahtar.cocukOlaylari(haneId, cocukId)).catch(bildir('olay')),
  ]);

  return json({ silindi: true });
}

/** Silme hatası ana işlemi bozmasın; artık kayıt kalması veri sızdırmaz. */
const bildir = (ne: string) => (e: unknown) => {
  console.warn(`[cocuk] ${ne} silinemedi:`, e);
};

export const config: Config = { path: '/api/cocuk' };
