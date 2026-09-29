// Google OAuth: yetkilendirme akışı ve erişim belirteci yenileme.
//
// Kritik ayrım: `invalid_grant` kalıcı bir hatadır — refresh token ölmüştür,
// yeniden denemek işe yaramaz, çocuğun tekrar izin vermesi gerekir. Diğer
// hatalar (ağ, 5xx, kota) geçicidir ve sonraki taramada düzelebilir.
// Bu ikisini karıştırmak ya boşuna yeniden denemeye ya da çalışan bir
// bağlantıyı "koptu" diye işaretlemeye yol açar.

export const SCOPE_LISTESI = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
] as const;

const TOKEN_UCU = 'https://oauth2.googleapis.com/token';
const YETKI_UCU = 'https://accounts.google.com/o/oauth2/v2/auth';

/** Refresh token kalıcı olarak geçersiz. Çocuğun yeniden izin vermesi gerekir. */
export class YenidenIzinGerekli extends Error {
  constructor(public readonly sebep: string) {
    super(`Google bağlantısı geçersiz: ${sebep}`);
    this.name = 'YenidenIzinGerekli';
  }
}

/** Geçici hata; sonraki taramada yeniden denenebilir. */
export class GeciciGoogleHatasi extends Error {
  constructor(message: string, public readonly durumKodu?: number) {
    super(message);
    this.name = 'GeciciGoogleHatasi';
  }
}

interface Kimlik {
  istemciId: string;
  istemciGizli: string;
}

function kimlik(): Kimlik {
  const istemciId = process.env.GOOGLE_ISTEMCI_ID;
  const istemciGizli = process.env.GOOGLE_ISTEMCI_GIZLI;
  if (!istemciId || !istemciGizli) {
    throw new Error('GOOGLE_ISTEMCI_ID / GOOGLE_ISTEMCI_GIZLI tanımlı değil.');
  }
  return { istemciId, istemciGizli };
}

/**
 * Çocuğun izin vereceği Google yetkilendirme adresini üretir.
 *
 * `access_type=offline` olmadan refresh token hiç gelmez.
 * `prompt=consent` olmadan ikinci yetkilendirmede refresh token alanı boş döner.
 */
export function yetkiAdresi(yonlendirme: string, durumBelirteci: string): string {
  const { istemciId } = kimlik();
  const sorgu = new URLSearchParams({
    client_id: istemciId,
    redirect_uri: yonlendirme,
    response_type: 'code',
    scope: SCOPE_LISTESI.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state: durumBelirteci,
  });
  return `${YETKI_UCU}?${sorgu}`;
}

export interface TokenSonucu {
  erisimBelirteci: string;
  /** Yalnızca ilk yetkilendirmede gelir. */
  yenilemeBelirteci: string | null;
  sonaErmeUtc: number;
}

/** Yetkilendirme kodunu belirteçlerle takas eder. */
export async function koduTakasEt(kod: string, yonlendirme: string): Promise<TokenSonucu> {
  const { istemciId, istemciGizli } = kimlik();
  return tokenIstegi({
    client_id: istemciId,
    client_secret: istemciGizli,
    code: kod,
    grant_type: 'authorization_code',
    redirect_uri: yonlendirme,
  });
}

/** Refresh token ile yeni erişim belirteci alır. */
export async function erisimBelirteciYenile(yenilemeBelirteci: string): Promise<TokenSonucu> {
  const { istemciId, istemciGizli } = kimlik();
  return tokenIstegi({
    client_id: istemciId,
    client_secret: istemciGizli,
    refresh_token: yenilemeBelirteci,
    grant_type: 'refresh_token',
  });
}

async function tokenIstegi(govde: Record<string, string>): Promise<TokenSonucu> {
  let cevap: Response;
  try {
    cevap = await fetch(TOKEN_UCU, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(govde),
    });
  } catch (e) {
    throw new GeciciGoogleHatasi(`Token ucuna ulaşılamadı: ${(e as Error).message}`);
  }

  const metin = await cevap.text();

  if (!cevap.ok) {
    const hata = jsonCoz(metin);
    const kod = typeof hata?.error === 'string' ? hata.error : `http_${cevap.status}`;
    const ayrinti = typeof hata?.error_description === 'string' ? hata.error_description : metin.slice(0, 200);

    // Kalıcı: token iptal edilmiş, süresi dolmuş ya da istemci eşleşmiyor.
    if (kod === 'invalid_grant') throw new YenidenIzinGerekli(ayrinti || kod);
    // Kalıcı ama bizim hatamız: yanlış istemci kimliği/gizli.
    if (kod === 'invalid_client') {
      throw new Error(`Google istemci kimlik bilgileri geçersiz: ${ayrinti}`);
    }
    throw new GeciciGoogleHatasi(`${kod}: ${ayrinti}`, cevap.status);
  }

  const d = jsonCoz(metin);
  const erisim = d?.access_token;
  if (typeof erisim !== 'string') {
    throw new GeciciGoogleHatasi('Cevapta access_token yok');
  }
  const omur = typeof d?.expires_in === 'number' ? d.expires_in : 3600;

  return {
    erisimBelirteci: erisim,
    yenilemeBelirteci: typeof d?.refresh_token === 'string' ? d.refresh_token : null,
    sonaErmeUtc: Date.now() + omur * 1000,
  };
}

function jsonCoz(metin: string): Record<string, unknown> | null {
  try {
    return JSON.parse(metin) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Yetkilendirilen kullanıcının Google kimliğini alır. */
export async function kullaniciKimligi(erisimBelirteci: string): Promise<string> {
  const cevap = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { authorization: `Bearer ${erisimBelirteci}` },
  });
  if (!cevap.ok) {
    throw new GeciciGoogleHatasi(`userinfo başarısız: HTTP ${cevap.status}`, cevap.status);
  }
  const d = await cevap.json() as { sub?: string };
  if (!d.sub) throw new GeciciGoogleHatasi('userinfo cevabında sub yok');
  return d.sub;
}
