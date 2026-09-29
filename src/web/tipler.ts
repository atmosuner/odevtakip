import type { CSSProperties } from 'react';
import type { Gorunum } from '../model';

// --- Uygulama verisi -----------------------------------------------------

export interface OdevGorunumu {
  id: string;
  dersAdi: string;
  baslik: string;
  gorunum: Gorunum;
  /** Son teslim anı, UTC epoch ms. Tarihsiz ödevlerde null. */
  sonTeslimUtc: number | null;
  puan: number | null;
  enYuksekPuan: number | null;
  baglanti: string;
}

export interface Cocuk {
  id: string;
  ad: string;
  /** "5. sınıf" gibi serbest metin. */
  sinif: string;
  /** Google bağlantısı koptu; bu çocuğun verisi güncellenmiyor. */
  baglantiKopuk: boolean;
  odevler: OdevGorunumu[];
}

export type PanoDurumu =
  | 'normal'
  | 'yukleniyor'
  | 'veri-yok'      // çocuk bağlı, ilk tarama henüz çalışmadı
  | 'cocuk-yok'     // hane kurulu, çocuk eklenmemiş
  | 'eski'          // veri 2 saatten eski
  | 'cevrimdisi';

export interface PanoVerisi {
  haneAdi: string;
  cocuklar: Cocuk[];
  /** Son başarılı taramanın anı, UTC epoch ms. */
  sonGuncellemeUtc: number | null;
  /** İlk taramanın anı. Öncesi "takip öncesi" sayılır. */
  ilkTaramaUtc: number | null;
  durum: PanoDurumu;
}

/** Panonun dışarıya bağlandığı eylemler. */
export interface PanoEylemleri {
  onAyarlar?: () => void;
  onCocukEkle?: () => void;
  onYenidenBagla?: () => void;
}

// --- Pano prop parçaları -------------------------------------------------

/** Takvim hücresi. Boş hücreler ayın ilk gününden önceki dolgudur. */
export interface Hucre {
  bos: boolean;
  dolu: boolean;
  gun?: number;
  eksik?: boolean;
  bekliyor?: boolean;
  tamam?: boolean;
  secili?: boolean;
  sec?: () => void;
  stil?: CSSProperties;
  sayiStil?: CSSProperties;
  aria?: string;
}

/** Bir ödev satırı — gün listesinde ve eksik panelinde kullanılır. */
export interface Satir {
  /** Ders adı; çoklu çocukta "Ad · Ders". */
  ust: string;
  baslik: string;
  etiket: string;
  eksik: boolean;
  bekliyor: boolean;
  tamam: boolean;
  puanVar: boolean;
  puan: string;
  href: string;
  harf: string;
  renk: string;
  coklu: boolean;
  /** Çocuğun dizideki sırası — eksik panelinde filtreleme için. */
  ci: number;
  /** Kaç gün geçti; sıralama için. Eksik değilse 0. */
  gec: number;
  aria: string;
}

/** Takvim sütunu — telefonda bir tane, masaüstünde çocuk başına bir tane. */
export interface Kolon {
  ad: string;
  sinif: string;
  harf: string;
  renk: string;
  /** "Zeynep'in" — Türkçe tamlayan eki uygulanmış hali. */
  adIn: string;
  kopuk: boolean;
  ilkTarama: boolean;
  baslikGoster: boolean;
  ayBaslik: string;
  hucreler: Hucre[];
  takipNotu: string;
  takipVar: boolean;
  gunBaslik: string;
  gunOdev: Satir[];
  gunVar: boolean;
  gunBos: boolean;
  tarihsiz: Satir[];
  tarihsizVar: boolean;
}

/** Durum bandındaki çocuk çipi. */
export interface BandCocuk {
  ad: string;
  harf: string;
  renk: string;
  sayi: number;
  eksikVar: boolean;
  metin: string;
  metinRenk: string;
}

/** Alt raftaki çocuk seçici düğmesi. */
export interface DockOgesi {
  ad: string;
  harf: string;
  renk: string;
  sayi: number;
  rozet: boolean;
  kopuk: boolean;
  secili: boolean;
  nokta: string;
  sec: () => void;
  aria: string;
  stil: CSSProperties;
}

/** Eksik ödev panelindeki çocuk filtresi. */
export interface Filtre {
  ad: string;
  secili: boolean;
  stil: CSSProperties;
  sec: () => void;
  renkVar: boolean;
  renk?: string;
  harf?: string;
}

// --- Üretilen bileşenlerin prop sözleşmeleri -----------------------------
//
// Adlar `src/web/uretilen/*.sozlesme.ts` dosyalarından gelir; oradaki liste
// değişirse burası da değişmeli. `npm run port` sonrası sözleşmeyi kontrol et.

export interface PanoProps {
  // düzen
  telefon: boolean;
  masa: boolean;
  yukleniyor: boolean;
  cocukYok: boolean;
  icerik: boolean;
  altBosluk: string;
  haneAdi: string;

  // veri tazeliği
  tazelikNormal: boolean;
  tazelikUyari: boolean;
  tazelikMetin: string;
  /** Tazelik göstergesine dokunulunca elle tazeleme. */
  tazele: () => void;

  // durum bandı
  bandTek: boolean;
  bandCokluA: boolean;
  bandCokluB: boolean;
  bandBaslik: string;
  bandAlt: string;
  bandAltGoster: boolean;
  bandCipler: boolean;
  bandCocuklar: BandCocuk[];
  bandZemin: string;
  bandCizgi: string;
  bandOk: boolean;
  bandAria: string;

  // takvim
  kolonlar: Kolon[];
  iskelet: number[];
  ayGeri: () => void;
  ayIleri: () => void;
  tBas: (e: React.TouchEvent) => void;
  tSon: (e: React.TouchEvent) => void;

  // eksik ödevler paneli
  filtreler: Filtre[];
  filtreGoster: boolean;
  eksikSatirlar: Satir[];
  eksikVar: boolean;
  eksikBos: boolean;
  sheetAcik: boolean;
  sheetAc: () => void;
  sheetKapat: () => void;

  // çocuk seçici
  dock: DockOgesi[];
  dockA: boolean;
  dockB: boolean;
  secAd: string;
  secHarf: string;
  secRenk: string;
  secAlt: string;
  secAria: string;
  sonrakiCocuk: () => void;

  // eylemler
  ayarlar: () => void;
  cocukEkle: () => void;
  yenidenBagla: () => void;
}

// --- Hesap ve kurulum ekranları ------------------------------------------

/** Hesap akışındaki ekranlar. Aynı bileşen hepsini barındırır. */
export type HesapEkrani =
  | 'ikon'        // PWA ana ekran ikonu önizlemesi
  | 'acilis'      // açılış (splash)
  | 'giris'       // e-posta ile giriş
  | 'eposta'      // "E-postanı kontrol et"
  | 'gecersiz'    // giriş bağlantısı süresi geçmiş
  | 'kurulum1'    // hane adı
  | 'kurulum2'    // çocuk adı
  | 'bagla'       // QR / bağlantı paylaş, izin bekleniyor
  | 'izin'        // çocuğun gördüğü izin ekranı
  | 'basari'      // bağlantı kuruldu
  | 'hata'        // bağlantı kurulamadı
  | 'kurulum3'    // ikinci ebeveyn daveti
  | 'ayarlar'     // hane ayarları
  | 'kaldir'      // bağlantıyı kaldırma onayı
  | 'pano';       // panoya çıkış

/** Hangi ekranın açık olduğu — her anahtar için tek bir true. */
export type EkranBayraklari = Record<HesapEkrani, boolean>;

/** Ekrana geçiş eylemleri. */
export type EkranGecisleri = Record<HesapEkrani, () => void>;

/** Kurulum adım göstergesindeki bir nokta. */
export interface AdimNoktasi {
  renk: string;
}

/** QR kodunun tek hücresi; `r` hücre rengidir. */
export interface QrHucresi {
  r: string;
}

/** Ayarlar ekranındaki ebeveyn satırı. */
export interface AyarEbeveyn {
  harf: string;
  ad: string;
  eposta: string;
  /** Oturum açmış kişi — yanında "(siz)" etiketi görünür. */
  benMiyim: boolean;
  /** Çıkarma düğmesi görünsün mü (kendisi ve tek ebeveyn için gizli). */
  cikarGoster: boolean;
  cikar: () => void;
  cikarAria: string;
}

/** Ayarlar ekranındaki çocuk satırı. */
export interface AyarCocuk {
  harf: string;
  ad: string;
  sinif: string;
  renk: string;
  /** Bağlantı durumu — üçü birbirini dışlar. */
  bekliyor: boolean;
  bagli: boolean;
  koptu: boolean;
  durumMetin: string;
  kaldir: () => void;
  kaldirAria: string;
  /** Yalnızca `koptu` iken anlamlı. */
  yenidenBagla: () => void;
}

export interface HesapEkranlariProps {
  e: EkranBayraklari;
  git: EkranGecisleri;

  // hane
  haneAdi: string;
  haneAdiDegis: (e: React.ChangeEvent<HTMLInputElement>) => void;
  haneAdiKaydet: () => void;
  ebeveynler: AyarEbeveyn[];
  cocuklar: AyarCocuk[];
  /** "Bahadır ve Elif" — çocuğun izin ekranında geçer. */
  ebeveynAdlari: string;

  /** Kurulumda kaçıncı adımdayız (1-3). Kurulum dışında 0. */
  adim: number;
  adimlar: AdimNoktasi[];
  kurulumUst: boolean;
  /** Hane ayarları gövdesi görünür mü (ayarlar ve kaldırma onayı ekranları). */
  ayarlarGoster: boolean;

  // form alanları
  eposta: string;
  epostaDegis: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hane: string;
  haneDegis: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cocuk: string;
  cocukDegis: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** "Ahmet'in" — Türkçe tamlayan eki uygulanmış hali. */
  cocukIn: string;
  davet: string;
  davetDegis: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // çocuk bağlama
  qr: QrHucresi[];
  /** Izgaranın kenar uzunluğu (modül sayısı). Adres uzunluğuna göre değişir. */
  qrModul: number;
  /** Bir modülün kenarı, `4px` gibi. */
  qrBoyut: string;
  kopyala: () => void;
  kopyalaMetin: string;

  /** Ana ekran ikonu önizlemesindeki dolgu kutucukları. */
  bosIkonlar: number[];
}
