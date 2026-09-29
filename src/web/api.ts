// Sunucu çağrıları.
//
// Oturum HttpOnly çerezde olduğu için `credentials: 'same-origin'` şart;
// aksi halde çerez gönderilmez ve her istek 401 döner.

import type { PanoVerisi } from './tipler';

export class ApiHatasi extends Error {
  constructor(
    public readonly durum: number,
    mesaj: string,
    public readonly kod?: string,
  ) {
    super(mesaj);
    this.name = 'ApiHatasi';
  }
  /** Oturum yok ya da süresi dolmuş — giriş ekranına dönülmeli. */
  get oturumGerekli(): boolean { return this.durum === 401; }
}

/** Ağa hiç ulaşılamadı; çevrimdışı olabiliriz. */
export class AgHatasi extends Error {
  constructor(mesaj: string) { super(mesaj); this.name = 'AgHatasi'; }
}

async function cagir<T>(
  yol: string,
  secenek: RequestInit = {},
): Promise<T> {
  let cevap: Response;
  try {
    cevap = await fetch(yol, {
      credentials: 'same-origin',
      headers: secenek.body ? { 'content-type': 'application/json' } : {},
      ...secenek,
    });
  } catch (e) {
    throw new AgHatasi((e as Error).message);
  }

  const metin = await cevap.text();
  const govde = metin ? JSON.parse(metin) as Record<string, unknown> : {};

  if (!cevap.ok) {
    throw new ApiHatasi(
      cevap.status,
      typeof govde['hata'] === 'string' ? govde['hata'] : `HTTP ${cevap.status}`,
      typeof govde['kod'] === 'string' ? govde['kod'] : undefined,
    );
  }
  return govde as T;
}

// --- Pano ----------------------------------------------------------------

export interface VeriYaniti {
  veri: PanoVerisi;
  ebeveynId: string;
  tazelemeEsigiMs: number;
}

export interface TazeleYaniti {
  veri: PanoVerisi;
  tarama: {
    degistiMi: boolean;
    cocuklar: { cocukId: string; durum: string }[];
  };
}

/** Önbellekten okur; hızlıdır, tarama yapmaz. */
export const veriAl = () => cagir<VeriYaniti>('/api/veri');

/** Classroom'u tarar. Çocuk başına asgari aralık sunucuda uygulanır. */
export const tazele = () => cagir<TazeleYaniti>('/api/tazele', { method: 'POST' });

// --- Hesap ---------------------------------------------------------------

export interface GirisYaniti {
  gonderildi: boolean;
  /** Yalnızca geliştirmede: e-posta yapılandırılmamışsa bağlantı burada. */
  gelistirmeBaglantisi?: string;
}

export const girisIste = (eposta: string) =>
  cagir<GirisYaniti>('/api/giris', {
    method: 'POST',
    body: JSON.stringify({ eposta }),
  });

export const cikisYap = () => cagir<{ cikildi: boolean }>('/api/cikis', { method: 'POST' });

// --- Hane ----------------------------------------------------------------

export interface HaneOzeti {
  hane: {
    id: string;
    ad: string;
    kurulmaUtc: number;
    ebeveynler: {
      id: string; eposta: string; ad: string;
      katilmaUtc: number; benMiyim: boolean;
    }[];
    cocuklar: {
      id: string; ad: string; sinif: string;
      baglanti: 'bekliyor' | 'bagli' | 'koptu';
      eklenmeUtc: number;
      ilkTaramaUtc: number | null;
      sonTaramaUtc: number | null;
    }[];
  };
}

export const haneAl = () => cagir<HaneOzeti>('/api/hane');

export const haneAdiDegistir = (ad: string) =>
  cagir<HaneOzeti>('/api/hane', { method: 'PATCH', body: JSON.stringify({ ad }) });

export interface DavetYaniti {
  cocukId?: string;
  cocukAdi: string;
  davetAdresi: string;
  sonKullanmaUtc: number;
}

export const cocukEkle = (ad: string, sinif: string) =>
  cagir<DavetYaniti>('/api/cocuk', {
    method: 'POST',
    body: JSON.stringify({ ad, sinif }),
  });

/** Bağlantısı kopan çocuk için yeni davet üretir. */
export const yenidenBagla = (cocukId: string) =>
  cagir<DavetYaniti>('/api/cocuk', {
    method: 'POST',
    body: JSON.stringify({ cocukId }),
  });

export const cocukSil = (cocukId: string) =>
  cagir<{ silindi: boolean }>(
    `/api/cocuk?cocukId=${encodeURIComponent(cocukId)}`, { method: 'DELETE' });

export const ebeveynDavetEt = (eposta: string) =>
  cagir<{ davetEdildi: boolean; eposta: string; gelistirmeBaglantisi?: string }>(
    '/api/ebeveyn', { method: 'POST', body: JSON.stringify({ eposta }) });

export const ebeveynCikar = (ebeveynId: string) =>
  cagir<{ cikarildi: boolean }>(
    `/api/ebeveyn?ebeveynId=${encodeURIComponent(ebeveynId)}`, { method: 'DELETE' });
