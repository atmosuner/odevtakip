// POST /api/cikis — oturum çerezini siler.
//
// Oturum sunucuda tutulmadığı için "iptal" yok; çerez silinir. Elde kalmış
// bir kopyanın süresi dolana kadar geçerli olması kabul edilen bir bedel —
// alternatifi her istekte sunucu tarafı oturum kaydı okumak olurdu.

import type { Config, Context } from '@netlify/functions';
import { cerezSil } from '../../src/server/oturum';
import { json, yanlisYontem } from '../../src/server/yanit';

export default async (istek: Request, _baglam: Context): Promise<Response> => {
  if (istek.method !== 'POST') return yanlisYontem();
  return json({ cikildi: true }, { 'set-cookie': cerezSil() });
};

export const config: Config = { path: '/api/cikis' };
