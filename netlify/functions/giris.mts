// POST /api/giris — e-postaya tek kullanımlık giriş bağlantısı gönderir.
//
// Güvenlik notu: yanıt, adresin kayıtlı olup olmadığını ASLA belli etmez.
// Aksi halde uç nokta bir hesap numaralandırma aracına dönüşür — saldırgan
// hangi e-postaların sistemde olduğunu öğrenir. Her durumda aynı yanıt döner.

import type { Config, Context } from '@netlify/functions';
import { biletUret, biletOzeti, epostaAnahtari } from '../../src/server/kripto';
import { girisBileti, epostaKaydi } from '../../src/server/db';
import { girisBaglantisiGonder } from '../../src/server/eposta';
import { girisBaglantisi } from '../../src/server/adres';
import { SEMA_SURUMU } from '../../src/server/sema';
import { json, hata, yanlisYontem, icHata } from '../../src/server/yanit';

/** Bilet ömrü. Kısa tutuluyor: e-posta kutusu ele geçse bile pencere dar. */
const OMUR_MS = 15 * 60_000;

const EPOSTA_BICIMI = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  if (istek.method !== 'POST') return yanlisYontem();

  try {
    const govde = await istek.json().catch(() => null) as { eposta?: unknown } | null;
    const eposta = typeof govde?.eposta === 'string' ? govde.eposta.trim() : '';

    if (!EPOSTA_BICIMI.test(eposta) || eposta.length > 254) {
      return hata(400, 'Geçerli bir e-posta adresi girin', 'eposta-bicimi');
    }

    const anahtarAdi = epostaAnahtari(eposta);
    const kayit = await epostaKaydi.oku(anahtarAdi);

    const bilet = biletUret();
    await girisBileti.olustur(biletOzeti(bilet), {
      sema: SEMA_SURUMU,
      eposta,
      // Kayıt yoksa hane de yok; doğrulama sonrası kurulum akışı başlar.
      haneId: kayit?.deger.haneId ?? null,
      ebeveynId: kayit?.deger.ebeveynId ?? null,
      olusturmaUtc: Date.now(),
      sonKullanmaUtc: Date.now() + OMUR_MS,
      kullanildiUtc: null,
    });

    const gonderim = await girisBaglantisiGonder(eposta, girisBaglantisi(istek, bilet));

    // Aynı yanıt: adres kayıtlı olsa da olmasa da.
    return json({
      gonderildi: true,
      ...(gonderim.gelistirmeBaglantisi
        ? { gelistirmeBaglantisi: gonderim.gelistirmeBaglantisi }
        : {}),
    });
  } catch (e) {
    return icHata(e, 'giris');
  }
};

export const config: Config = { path: '/api/giris' };
