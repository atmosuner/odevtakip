// GET /api/baglan?davet=… — çocuğu Google izin ekranına yönlendirir.
//
// Bu adres QR koda gömülür ve çocuğun cihazında açılır. Çocuğun velinin
// oturumuna ihtiyacı yok: yetki davet biletinden gelir. Bilet kısa ömürlü
// ve tek kullanımlık.
//
// `state` parametresi davet biletinin özetini taşır; geri dönüşte hangi
// çocuk için izin verildiğini buradan anlıyoruz. Bilet özetinin kendisi
// tahmin edilemez olduğu için ayrıca CSRF belirteci gerekmiyor.

import type { Config, Context } from '@netlify/functions';
import { biletOzeti } from '../../src/server/kripto';
import { davet } from '../../src/server/db';
import { yetkiAdresi } from '../../src/server/google';
import { geriDonusAdresi } from '../../src/server/adres';
import { yonlendir, icHata } from '../../src/server/yanit';

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  try {
    const bilet = new URL(istek.url).searchParams.get('davet');
    if (!bilet) return yonlendir('/bagla?hata=eksik');

    const ozet = biletOzeti(bilet);
    const kayit = await davet.oku(ozet);

    if (!kayit || kayit.deger.tur !== 'cocuk-bagla') {
      return yonlendir('/bagla?hata=gecersiz');
    }
    const d = kayit.deger;
    if (d.kullanildiUtc != null || d.sonKullanmaUtc < Date.now()) {
      return yonlendir('/bagla?hata=suresi-doldu');
    }

    return yonlendir(yetkiAdresi(geriDonusAdresi(istek), ozet));
  } catch (e) {
    return icHata(e, 'baglan');
  }
};

export const config: Config = { path: '/api/baglan' };
