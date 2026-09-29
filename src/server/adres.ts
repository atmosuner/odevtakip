// Kök adres hesabı.
//
// Tek yerde tutuluyor çünkü OAuth geri dönüş adresi Google Cloud Console'daki
// "Authorized redirect URIs" listesiyle BİREBİR eşleşmek zorunda. İki yerde
// ayrı hesaplanırsa biri değişip diğeri kalır ve `redirect_uri_mismatch` alınır.

/**
 * Sitenin kök adresi.
 *
 * `SITE_ADRESI` tanımlıysa o kullanılır. Tanımlı değilse isteğin kendi
 * adresinden türetilir — bu yalnızca geliştirme için güvenlidir; üretimde
 * ters vekil başlıkları sahte olabileceği için açık değer konmalı.
 */
export function tabanAdres(istek: Request): string {
  const acik = process.env.SITE_ADRESI;
  if (acik) return acik.replace(/\/+$/, '');

  const u = new URL(istek.url);
  return `${u.protocol}//${u.host}`;
}

/** Google OAuth geri dönüş adresi. Console'daki kayıtla aynı olmalı. */
export function geriDonusAdresi(istek: Request): string {
  return `${tabanAdres(istek)}/api/geridonus`;
}

/** E-postadaki giriş bağlantısı. */
export function girisBaglantisi(istek: Request, bilet: string): string {
  return `${tabanAdres(istek)}/api/dogrula?bilet=${encodeURIComponent(bilet)}`;
}

/**
 * QR koda gömülen, çocuğun açacağı bağlantı.
 *
 * Doğrudan Google'a değil, önce kendi izin açıklama sayfamıza gider:
 * çocuk neyin paylaşılacağını (ödev listesi, teslim durumu, notlar) orada
 * okur, sonra kendi isteğiyle Google'a geçer. Brief'in şartı bu — akış
 * gizli izleme gibi durmamalı.
 */
export function baglantiDaveti(istek: Request, bilet: string): string {
  return `${tabanAdres(istek)}/bagla?davet=${encodeURIComponent(bilet)}`;
}

/** İzin sayfasındaki düğmenin gittiği yer; asıl Google yönlendirmesi. */
export function googleyeGecis(bilet: string): string {
  return `/api/baglan?davet=${encodeURIComponent(bilet)}`;
}
