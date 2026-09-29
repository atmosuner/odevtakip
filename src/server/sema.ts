// Kalıcı veri şeması.
//
// Blobs anahtar düzeni (`/` alt dizin gibi davranır, list({prefix}) ile gezilir):
//
//   hane/<haneId>/yapi                  → hane yapılandırması (ebeveynler, çocuklar, tokenlar)
//   hane/<haneId>/cocuk/<cocukId>/veri  → tarama çıktısı (dersler, ödevler, teslimler)
//   hane/<haneId>/cocuk/<cocukId>/olay  → teslim geçmişi olayları
//   eposta/<epostaAnahtari>             → giriş için ebeveyn araması
//   giris/<tokenOzeti>                  → tek kullanımlık giriş bağlantısı
//   davet/<tokenOzeti>                  → çocuk bağlama ya da ebeveyn daveti
//
// Yazma yolları kasıtlı olarak ayrıldı: `yapi` kullanıcı eylemleriyle (seyrek),
// `veri` yalnızca sync ile (çocuk başına tek yazar) değişir. Böylece iki yazarın
// aynı anahtarda çakışması olağan akışta hiç olmaz.

/** Şema sürümü. Okurken kontrol edilir; ileride göç gerekirse buradan ayrılır. */
export const SEMA_SURUMU = 1;

// --- Hane yapılandırması -------------------------------------------------

export interface Ebeveyn {
  id: string;
  eposta: string;
  /** Görünen ad; e-postadan türetilir, kullanıcı değiştirebilir. */
  ad: string;
  katilmaUtc: number;
  sonGirisUtc: number | null;
}

/** Çocuğun Google bağlantısının durumu. */
export type BaglantiDurumu =
  | 'bekliyor'      // davet üretildi, çocuk henüz izin vermedi
  | 'bagli'
  | 'koptu';        // refresh token geçersiz, yeniden izin gerekiyor

export interface Cocuk {
  id: string;
  ad: string;
  /** "5. sınıf" gibi serbest metin; kullanıcı girer. */
  sinif: string;
  eklenmeUtc: number;

  baglanti: BaglantiDurumu;
  /** Bağlantı koptuysa Google'ın döndürdüğü sebep; teşhis için. */
  kopmaSebebi: string | null;
  kopmaUtc: number | null;

  /**
   * Şifrelenmiş Google refresh token.
   * Asla düz metin saklanmaz; bkz. src/server/kripto.ts.
   * Bağlantı kurulmadan önce null.
   */
  tokenSifreli: string | null;
  /** Classroom'daki kullanıcı kimliği; teslimleri `userId` ile eşlerken gerekir. */
  googleKullaniciId: string | null;

  ilkTaramaUtc: number | null;
  sonTaramaUtc: number | null;
}

export interface HaneYapisi {
  sema: number;
  id: string;
  ad: string;
  kurulmaUtc: number;
  ebeveynler: Ebeveyn[];
  cocuklar: Cocuk[];
}

// --- Tarama çıktısı ------------------------------------------------------

export interface Ders {
  id: string;
  ad: string;
  bolum: string | null;
  durum: string;
  baglanti: string;
  /** Bu taramada görüldü mü; görülmeyenler arşive alınır. */
  sonGorulmeUtc: number;
}

export interface KayitliOdev {
  id: string;
  dersId: string;
  dersAdi: string;
  baslik: string;
  tur: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  durum: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  sonTeslimUtc: number | null;
  sadeceGun: boolean;
  enYuksekPuan: number | null;
  baglanti: string;
  olusturmaUtc: number | null;
  guncellemeUtc: number | null;

  ilkGorulmeUtc: number;
  sonGorulmeUtc: number;
  /**
   * Taramada görülmediği için silinmiş sayıldı.
   * Satır silinmez: geçmiş bozulmasın, "geçen ay 3 eksik vardı" doğru kalsın.
   */
  silinmeUtc: number | null;
}

export interface KayitliTeslim {
  id: string;
  odevId: string;
  durum: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  gecKaydi: boolean;
  verilenPuan: number | null;
  /** `stateHistory` içinde TURNED_IN görüldü mü. */
  teslimEdildiMi: boolean;
  guncellemeUtc: number | null;
  sonGorulmeUtc: number;
}

export interface CocukVerisi {
  sema: number;
  cocukId: string;
  dersler: Ders[];
  odevler: KayitliOdev[];
  teslimler: KayitliTeslim[];
  sonTaramaUtc: number | null;
}

// --- Teslim geçmişi ------------------------------------------------------

/**
 * `submissionHistory`'den türetilen olaylar.
 *
 * `anahtar` alanı idempotentliği sağlar: her taramada aynı geçmiş yeniden
 * yazılır, aynı anahtara sahip olanlar tekrarlanmaz. Kaçırılan bir tarama
 * geçmişi bozmaz.
 */
export interface Olay {
  /** `<teslimId>|<tur>|<zamanUtc>|<ayrinti>` — tekrar engelleyici. */
  anahtar: string;
  teslimId: string;
  odevId: string;
  tur: 'durum' | 'puan';
  zamanUtc: number;
  /** tur='durum' ise Classroom durumu. */
  durum: string | null;
  /** tur='puan' ise alınan puan. */
  puan: number | null;
  enYuksekPuan: number | null;
  aktorId: string | null;
}

export interface CocukOlaylari {
  sema: number;
  cocukId: string;
  olaylar: Olay[];
}

// --- Kimlik ve davet -----------------------------------------------------

export interface EpostaKaydi {
  sema: number;
  ebeveynId: string;
  haneId: string;
}

export interface GirisBileti {
  sema: number;
  eposta: string;
  /** Yeni kullanıcıysa hane yoktur; giriş sonrası kurulum akışı başlar. */
  haneId: string | null;
  ebeveynId: string | null;
  olusturmaUtc: number;
  sonKullanmaUtc: number;
  kullanildiUtc: number | null;
}

export type DavetTuru = 'cocuk-bagla' | 'ebeveyn-davet';

export interface Davet {
  sema: number;
  tur: DavetTuru;
  haneId: string;
  /** tur='cocuk-bagla' ise hangi çocuk için. */
  cocukId: string | null;
  /** tur='ebeveyn-davet' ise davet edilen e-posta. */
  eposta: string | null;
  olusturmaUtc: number;
  sonKullanmaUtc: number;
  kullanildiUtc: number | null;
}

// --- Anahtar üreticileri -------------------------------------------------
//
// Tek yerden üretilir: elle string birleştirme yazım hatası riski taşır ve
// anahtar düzeni değişirse her yeri aramak gerekir.

export const anahtar = {
  haneYapisi: (haneId: string) => `hane/${haneId}/yapi`,
  cocukVerisi: (haneId: string, cocukId: string) => `hane/${haneId}/cocuk/${cocukId}/veri`,
  cocukOlaylari: (haneId: string, cocukId: string) => `hane/${haneId}/cocuk/${cocukId}/olay`,
  eposta: (epostaAnahtari: string) => `eposta/${epostaAnahtari}`,
  giris: (tokenOzeti: string) => `giris/${tokenOzeti}`,
  davet: (tokenOzeti: string) => `davet/${tokenOzeti}`,
  /** Tüm haneleri gezmek için (sync). */
  haneOneki: 'hane/',
} as const;
