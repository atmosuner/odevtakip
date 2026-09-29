// GET /api/dogrula?bilet=… — giriş bağlantısını oturuma çevirir.
//
// Bilet tek kullanımlıktır ve doğrulandıktan sonra hemen silinir: e-posta
// kutusunda kalan bağlantı ikinci kez çalışmaz.
//
// Kayıtlı olmayan e-posta için burada hane kurulmaz; kullanıcı kurulum
// akışına yönlendirilir ve haneyi orada adlandırır. Böylece yarım kalmış
// kayıtlardan boş hane birikmez.

import type { Config, Context } from '@netlify/functions';
import { biletOzeti, kimlikUret, epostaAnahtari } from '../../src/server/kripto';
import { girisBileti, haneYapisi, epostaKaydi } from '../../src/server/db';
import { cerezYap } from '../../src/server/oturum';
import { SEMA_SURUMU } from '../../src/server/sema';
import { yonlendir, icHata } from '../../src/server/yanit';

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  try {
    const bilet = new URL(istek.url).searchParams.get('bilet');
    if (!bilet) return yonlendir('/giris?hata=eksik');

    const ozet = biletOzeti(bilet);
    const kayit = await girisBileti.oku(ozet);

    if (!kayit) return yonlendir('/giris?hata=gecersiz');

    const b = kayit.deger;
    if (b.kullanildiUtc != null || b.sonKullanmaUtc < Date.now()) {
      await girisBileti.sil(ozet);
      return yonlendir('/giris?hata=suresi-doldu');
    }

    // Tek kullanımlık: doğrulandığı anda sil. Aşağıda hata olursa kullanıcı
    // yeni bağlantı ister — kullanılmış bir bileti canlı bırakmaktan iyidir.
    await girisBileti.sil(ozet);

    if (b.haneId && b.ebeveynId) {
      await sonGirisiIsaretle(b.haneId, b.ebeveynId);
      return yonlendir('/', { 'set-cookie': cerezYap(b.ebeveynId, b.haneId) });
    }

    // Yeni kullanıcı: hane ve ebeveyn kaydı şimdi oluşturulur, adlandırma
    // kurulum ekranında yapılır.
    const haneId = kimlikUret();
    const ebeveynId = kimlikUret();
    const simdi = Date.now();

    await haneYapisi.yaz({
      sema: SEMA_SURUMU,
      id: haneId,
      ad: '',                          // kurulum 1. adımda girilir
      kurulmaUtc: simdi,
      ebeveynler: [{
        id: ebeveynId,
        eposta: b.eposta,
        ad: b.eposta.split('@')[0] ?? '',
        katilmaUtc: simdi,
        sonGirisUtc: simdi,
      }],
      cocuklar: [],
    }, null);

    await epostaKaydi.olustur(epostaAnahtari(b.eposta), {
      sema: SEMA_SURUMU, ebeveynId, haneId,
    });

    return yonlendir('/kurulum', { 'set-cookie': cerezYap(ebeveynId, haneId) });
  } catch (e) {
    return icHata(e, 'dogrula');
  }
};

/** Son giriş anını kaydeder; hata olursa girişi engellemez. */
async function sonGirisiIsaretle(haneId: string, ebeveynId: string): Promise<void> {
  try {
    await haneYapisi.guncelle(haneId, (m) => m && ({
      ...m,
      ebeveynler: m.ebeveynler.map((e) =>
        e.id === ebeveynId ? { ...e, sonGirisUtc: Date.now() } : e),
    }));
  } catch (e) {
    console.warn('[dogrula] son giriş yazılamadı:', e);
  }
}

export const config: Config = { path: '/api/dogrula' };
