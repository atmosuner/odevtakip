// GET /api/geridonus — Google OAuth dönüşü.
//
// Çocuk izin verdikten sonra buraya döner. Burada refresh token alınır,
// şifrelenip hane kaydına yazılır ve davet bileti kapatılır.
//
// Çocuğun cihazında çalışır; velinin oturumu yoktur. Yetki `state`
// parametresindeki davet bileti özetinden gelir.

import type { Config, Context } from '@netlify/functions';
import { davet, haneYapisi } from '../../src/server/db';
import { koduTakasEt, kullaniciKimligi } from '../../src/server/google';
import { tokenSifrele } from '../../src/server/kripto';
import { geriDonusAdresi } from '../../src/server/adres';
import { yonlendir, icHata } from '../../src/server/yanit';

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  try {
    const sorgu = new URL(istek.url).searchParams;

    // Çocuk izin ekranında "İzin verme" dediyse Google `error` ile döner.
    const googleHatasi = sorgu.get('error');
    if (googleHatasi) {
      return yonlendir(`/bagla?hata=${encodeURIComponent(googleHatasi)}`);
    }

    const kod = sorgu.get('code');
    const ozet = sorgu.get('state');
    if (!kod || !ozet) return yonlendir('/bagla?hata=eksik');

    const kayit = await davet.oku(ozet);
    if (!kayit || kayit.deger.tur !== 'cocuk-bagla' || !kayit.deger.cocukId) {
      return yonlendir('/bagla?hata=gecersiz');
    }
    const d = kayit.deger;
    if (d.kullanildiUtc != null || d.sonKullanmaUtc < Date.now()) {
      return yonlendir('/bagla?hata=suresi-doldu');
    }

    const cocukId = d.cocukId!;
    const token = await koduTakasEt(kod, geriDonusAdresi(istek));

    // `access_type=offline` + `prompt=consent` olmasına rağmen refresh token
    // gelmediyse bağlantı kalıcı olamaz; kullanıcıyı boşuna başarı ekranına
    // göndermek yerine hata veriyoruz.
    if (!token.yenilemeBelirteci) {
      console.error('[geridonus] refresh_token gelmedi');
      return yonlendir('/bagla?hata=token-yok');
    }

    const googleId = await kullaniciKimligi(token.erisimBelirteci).catch(() => null);
    const sifreli = tokenSifrele(token.yenilemeBelirteci, cocukId);

    const sonuc = await haneYapisi.guncelle(d.haneId, (m) => {
      if (!m) return null;
      if (!m.cocuklar.some((c) => c.id === cocukId)) return null;   // çocuk silinmiş
      return {
        ...m,
        cocuklar: m.cocuklar.map((c) => c.id === cocukId ? {
          ...c,
          baglanti: 'bagli' as const,
          kopmaSebebi: null,
          kopmaUtc: null,
          tokenSifreli: sifreli,
          googleKullaniciId: googleId,
        } : c),
      };
    });

    if (!sonuc) return yonlendir('/bagla?hata=cocuk-yok');

    // Bilet tek kullanımlık: başarıdan sonra silinir.
    await davet.sil(ozet);

    return yonlendir('/bagla?durum=basari');
  } catch (e) {
    return icHata(e, 'geridonus');
  }
};

export const config: Config = { path: '/api/geridonus' };
