// Oturum çerezi ve yetki kontrolü.
//
// Oturum HMAC ile imzalı, HttpOnly çerezde taşınır. Sunucu tarafında oturum
// kaydı tutulmuyor: imza geçerliyse ve süresi dolmamışsa kabul edilir.
// Bedeli, çıkış yapıldığında çerezin hemen geçersizleşmemesi — kabul edilebilir,
// çünkü çerez silindiğinde tarayıcıda zaten kalmıyor.

import { oturumImzala, oturumCoz } from './kripto';
import { haneYapisi } from './db';
import type { HaneYapisi } from './sema';

const CEREZ_ADI = 'od_oturum';
const OMUR_GUN = 30;

export interface Oturum {
  ebeveynId: string;
  haneId: string;
  /** Epoch ms; bu andan sonra geçersiz. */
  sonaErmeUtc: number;
}

/** İmzalı oturum çerezini üretir. */
export function cerezYap(ebeveynId: string, haneId: string): string {
  const oturum: Oturum = {
    ebeveynId, haneId,
    sonaErmeUtc: Date.now() + OMUR_GUN * 86_400_000,
  };
  const deger = oturumImzala(oturum);
  return [
    `${CEREZ_ADI}=${deger}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',      // Strict olursa e-postadaki bağlantıdan dönüşte çerez gitmez
    'Path=/',
    `Max-Age=${OMUR_GUN * 86_400}`,
  ].join('; ');
}

/** Çıkış için çerezi siler. */
export function cerezSil(): string {
  return `${CEREZ_ADI}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

/** İstekteki çerezden oturumu okur; geçersiz ya da süresi dolmuşsa null. */
export function oturumOku(istek: Request): Oturum | null {
  const ham = istek.headers.get('cookie');
  if (!ham) return null;

  const eslesme = new RegExp(`(?:^|;\\s*)${CEREZ_ADI}=([^;]+)`).exec(ham);
  if (!eslesme) return null;

  const oturum = oturumCoz<Oturum>(eslesme[1]);
  if (!oturum) return null;
  if (typeof oturum.sonaErmeUtc !== 'number' || oturum.sonaErmeUtc < Date.now()) return null;
  if (!oturum.ebeveynId || !oturum.haneId) return null;

  return oturum;
}

export interface Yetki {
  oturum: Oturum;
  hane: HaneYapisi;
}

/**
 * Oturumu doğrular ve haneyi yükler.
 *
 * Ebeveynin hâlâ o hanenin üyesi olduğu kontrol edilir: haneden çıkarılan
 * bir ebeveynin elindeki çerez, süresi dolmamış olsa bile çalışmamalı.
 */
export async function yetkiAl(istek: Request): Promise<Yetki | null> {
  const oturum = oturumOku(istek);
  if (!oturum) return null;

  const kayit = await haneYapisi.oku(oturum.haneId);
  if (!kayit) return null;

  const uye = kayit.deger.ebeveynler.some((e) => e.id === oturum.ebeveynId);
  if (!uye) return null;

  return { oturum, hane: kayit.deger };
}
