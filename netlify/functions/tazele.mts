// POST /api/tazele — Classroom'dan taze veri çeker.
//
// Pano açıldığında (veri eskiyse) ve elle tazelemede çağrılır.
// Çocuk başına asgari aralık `tarama.ts` içinde uygulanır: çok erken
// çağrılırsa tarama atlanır ve önbellek döner. İki velinin aynı anda
// açması ikinci taramayı tetiklemez.

import type { Config, Context } from '@netlify/functions';
import { yetkiAl } from '../../src/server/oturum';
import { haneyiTara } from '../../src/server/tarama';
import { haneYapisi } from '../../src/server/db';
import { panoVerisiYap } from '../../src/server/panoVerisi';
import { json, yetkisiz, yanlisYontem, icHata } from '../../src/server/yanit';

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  if (istek.method !== 'POST') return yanlisYontem();

  try {
    const yetki = await yetkiAl(istek);
    if (!yetki) return yetkisiz();

    const sonuc = await haneyiTara(yetki.hane);

    // Tarama hane yapısını değiştirmiş olabilir (bağlantı koptu, ilk tarama
    // anı yazıldı); güncel hâlini yeniden oku ki pano doğru durumu görsün.
    const guncel = await haneYapisi.oku(yetki.hane.id);
    const veri = await panoVerisiYap(guncel?.deger ?? yetki.hane);

    return json({
      veri,
      tarama: {
        degistiMi: sonuc.degistiMi,
        cocuklar: sonuc.cocuklar.map((c) => ({
          cocukId: c.cocukId,
          durum: c.durum,
          // Hata ayrıntısı istemciye gitmez; günlükte var.
        })),
      },
    });
  } catch (e) {
    return icHata(e, 'tazele');
  }
};

export const config: Config = { path: '/api/tazele' };
