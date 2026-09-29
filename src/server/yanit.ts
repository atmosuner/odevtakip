// HTTP yanıt yardımcıları.
//
// Hata gövdeleri kasıtlı olarak yalın: iç ayrıntılar (yığın izi, depo
// anahtarları, Google hata metinleri) istemciye sızmamalı. Ayrıntı sunucu
// günlüğüne yazılır.

export interface HataGovdesi {
  hata: string;
  /** İstemcinin davranış değiştirebileceği makine okunur kod. */
  kod?: string;
}

const JSON_BASLIK = { 'content-type': 'application/json; charset=utf-8' };

/** Önbelleklenmemesi gereken kişisel veri yanıtı. */
export function json(veri: unknown, ek: HeadersInit = {}): Response {
  return new Response(JSON.stringify(veri), {
    status: 200,
    headers: { ...JSON_BASLIK, 'cache-control': 'no-store', ...ek },
  });
}

export function hata(durum: number, mesaj: string, kod?: string): Response {
  const govde: HataGovdesi = kod ? { hata: mesaj, kod } : { hata: mesaj };
  return new Response(JSON.stringify(govde), {
    status: durum,
    headers: { ...JSON_BASLIK, 'cache-control': 'no-store' },
  });
}

export const yetkisiz = () => hata(401, 'Oturum gerekli', 'oturum-yok');
export const bulunamadi = (ne = 'Kayıt') => hata(404, `${ne} bulunamadı`, 'yok');
export const yanlisYontem = () => hata(405, 'Yöntem desteklenmiyor', 'yontem');

/** Beklenmeyen hatayı günlüğe yazar, istemciye yalın mesaj döner. */
export function icHata(e: unknown, baglam: string): Response {
  console.error(`[${baglam}]`, e);
  return hata(500, 'Beklenmeyen bir hata oluştu', 'ic-hata');
}

/** Tarayıcıyı yönlendirir. */
export function yonlendir(adres: string, ek: HeadersInit = {}): Response {
  return new Response(null, {
    status: 302,
    headers: { location: adres, 'cache-control': 'no-store', ...ek },
  });
}
