// GET /api/veri — panonun önbellekten beslenmesi.
//
// Tarama yapmaz; anında döner. Veli açtığı an boş ekran görmez, son bilinen
// veriyi görür. Tazeleme ayrı uç noktadan (POST /api/tazele) tetiklenir.

import type { Config, Context } from '@netlify/functions';
import { yetkiAl } from '../../src/server/oturum';
import { panoVerisiYap } from '../../src/server/panoVerisi';
import { json, yetkisiz, yanlisYontem, icHata } from '../../src/server/yanit';

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  if (istek.method !== 'GET') return yanlisYontem();

  try {
    const yetki = await yetkiAl(istek);
    if (!yetki) return yetkisiz();

    const veri = await panoVerisiYap(yetki.hane);

    return json({
      veri,
      ebeveynId: yetki.oturum.ebeveynId,
      // İstemci bu eşiğe bakarak otomatik tazeleme yapıp yapmayacağına karar verir.
      tazelemeEsigiMs: 5 * 60_000,
    });
  } catch (e) {
    return icHata(e, 'veri');
  }
};

export const config: Config = { path: '/api/veri' };
