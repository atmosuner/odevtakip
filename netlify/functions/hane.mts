// GET  /api/hane — ayarlar ekranı için hane özeti
// PATCH /api/hane — hane adını değiştirir
//
// Token'lar ve Google kimlikleri bu yanıtta ASLA yer almaz: ayarlar ekranının
// onlara ihtiyacı yok ve sızdırmanın hiçbir faydası yok.

import type { Config, Context } from '@netlify/functions';
import { yetkiAl } from '../../src/server/oturum';
import { haneYapisi } from '../../src/server/db';
import type { HaneYapisi } from '../../src/server/sema';
import { json, hata, yetkisiz, yanlisYontem, icHata } from '../../src/server/yanit';

const AD_EN_FAZLA = 60;

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  try {
    const yetki = await yetkiAl(istek);
    if (!yetki) return yetkisiz();

    if (istek.method === 'GET') return json(ozet(yetki));

    if (istek.method === 'PATCH') {
      const govde = await istek.json().catch(() => null) as { ad?: unknown } | null;
      const ad = typeof govde?.ad === 'string' ? govde.ad.trim() : '';

      if (!ad) return hata(400, 'Hane adı boş olamaz', 'ad-bos');
      if (ad.length > AD_EN_FAZLA) {
        return hata(400, `Hane adı en fazla ${AD_EN_FAZLA} karakter olabilir`, 'ad-uzun');
      }

      const guncel = await haneYapisi.guncelle(yetki.hane.id, (m) => m && ({ ...m, ad }));
      if (!guncel) return hata(409, 'Hane güncellenemedi', 'cakisma');

      return json(ozet({ ...yetki, hane: guncel }));
    }

    return yanlisYontem();
  } catch (e) {
    return icHata(e, 'hane');
  }
};

/** Ayarlar ekranının gördüğü hâl — gizli alanlar dışarıda. */
function ozet({ hane, oturum }: { hane: HaneYapisi; oturum: { ebeveynId: string } }) {
  return {
    hane: {
      id: hane.id,
      ad: hane.ad,
      kurulmaUtc: hane.kurulmaUtc,
      ebeveynler: hane.ebeveynler.map((e) => ({
        id: e.id,
        eposta: e.eposta,
        ad: e.ad,
        katilmaUtc: e.katilmaUtc,
        benMiyim: e.id === oturum.ebeveynId,
      })),
      cocuklar: hane.cocuklar.map((c) => ({
        id: c.id,
        ad: c.ad,
        sinif: c.sinif,
        baglanti: c.baglanti,
        eklenmeUtc: c.eklenmeUtc,
        ilkTaramaUtc: c.ilkTaramaUtc,
        sonTaramaUtc: c.sonTaramaUtc,
        // Kopma sebebi kullanıcıya gösterilmiyor (Google'ın iç metni),
        // yalnızca koptuğu bilgisi veriliyor.
      })),
    },
  };
}

export const config: Config = { path: '/api/hane' };
