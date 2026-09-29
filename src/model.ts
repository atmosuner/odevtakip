// Ödev durumu türetme ve tarih işlemleri.
//
// Saf fonksiyonlar: ağ, dosya, Netlify, React yok. Test edilebilir kalması ve
// barındırma değişirse taşınabilir olması için kasıtlı.

/** Türkiye 2016'dan beri yaz saati uygulamıyor; sabit UTC+3. */
export const TR_OFSET_DK = 180;

/** Google Classroom `Date` mesajı — alanlar eksik olabilir. */
export interface ClassroomTarih {
  year?: number;
  month?: number;
  day?: number;
}

/** Google Classroom `TimeOfDay` mesajı — alanlar eksik olabilir. */
export interface ClassroomSaat {
  hours?: number;
  minutes?: number;
  seconds?: number;
  nanos?: number;
}

export type OdevTuru = 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
export type OdevDurumu = 'PUBLISHED' | 'DRAFT' | 'DELETED';
export type TeslimDurumu = 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';

/** Panoda gösterilen dört durum. */
export type Gorunum = 'eksik' | 'bekliyor' | 'teslim' | 'not';

export interface Odev {
  id: string;
  dersId: string;
  dersAdi: string;
  baslik: string;
  tur: OdevTuru;
  durum: OdevDurumu;
  /** Son teslim anı, UTC epoch ms. Tarihi yoksa null. */
  sonTeslimUtc: number | null;
  /** Classroom yalnızca gün verdiyse true — saat bilgisi yok demektir. */
  sadeceGun: boolean;
  enYuksekPuan: number | null;
  baglanti: string;
  /** Tarama sırasında görülmediği için silinmiş sayıldı. */
  silindiMi: boolean;
}

export interface Teslim {
  id: string;
  odevId: string;
  durum: TeslimDurumu;
  /** Classroom'un kendi `late` bayrağı. Türetmede tek başına kullanılmaz. */
  gecKaydi: boolean;
  verilenPuan: number | null;
  /** `stateHistory` içinde TURNED_IN görüldü mü. */
  teslimEdildiMi: boolean;
}

// --- Tarih ---------------------------------------------------------------

/**
 * Classroom'un UTC cinsinden verdiği tarih+saati epoch ms'ye çevirir.
 *
 * Dokümandaki ifade: "Optional date, in UTC, that submissions for this course
 * work are due." Saat verilmemişse günün sonu (UTC 23:59:59.999) kabul edilir —
 * Classroom arayüzünde tarihi olup saati olmayan ödev "gün sonuna kadar"dır.
 */
export function sonTeslimAniUtc(
  tarih: ClassroomTarih | undefined,
  saat: ClassroomSaat | undefined,
): { utc: number; sadeceGun: boolean } | null {
  if (!tarih || tarih.year == null || tarih.month == null || tarih.day == null) return null;

  const saatVar = saat != null &&
    (saat.hours != null || saat.minutes != null || saat.seconds != null);

  const utc = saatVar
    ? Date.UTC(tarih.year, tarih.month - 1, tarih.day,
        saat.hours ?? 0, saat.minutes ?? 0, saat.seconds ?? 0, 0)
    : Date.UTC(tarih.year, tarih.month - 1, tarih.day, 23, 59, 59, 999);

  return { utc, sadeceGun: !saatVar };
}

/**
 * Bir UTC anının Türkiye'deki takvim gününü `YYYY-MM-DD` olarak verir.
 * Takvimde hangi hücreye düşeceğini bu belirler.
 */
export function trGunu(utcMs: number): string {
  const yerel = new Date(utcMs + TR_OFSET_DK * 60_000);
  const y = yerel.getUTCFullYear();
  const a = String(yerel.getUTCMonth() + 1).padStart(2, '0');
  const g = String(yerel.getUTCDate()).padStart(2, '0');
  return `${y}-${a}-${g}`;
}

/** `YYYY-MM-DD` günün Türkiye'deki başlangıcı, UTC epoch ms. */
export function trGunBasiUtc(gun: string): number {
  const [y, a, g] = gun.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, a - 1, g) - TR_OFSET_DK * 60_000;
}

/**
 * Son teslimden bu yana kaç tam Türkiye günü geçti.
 * "2 gün geçti" metni bunu kullanır. Aynı gün içindeyse 0.
 */
export function gecikmeGunu(sonTeslimUtc: number, simdiUtc: number): number {
  const a = trGunBasiUtc(trGunu(sonTeslimUtc));
  const b = trGunBasiUtc(trGunu(simdiUtc));
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

// --- Durum türetme -------------------------------------------------------

/** Teslim edilmemiş sayılan Classroom durumları. */
const TESLIM_EDILMEDI: ReadonlySet<TeslimDurumu> =
  new Set<TeslimDurumu>(['NEW', 'CREATED', 'RECLAIMED_BY_STUDENT']);

/**
 * Bir ödevin panoda hangi durumda görüneceğini belirler.
 *
 * `RETURNED` tek başına "teslim edildi" anlamına gelmez: öğretmen teslim
 * alınmamış bir ödevi de geri verebilir. Bu yüzden `teslimEdildiMi`
 * (stateHistory'de TURNED_IN var mı) esas alınır.
 *
 * Classroom'un `late` bayrağı türetmede kullanılmaz — dokümantasyon teslim
 * edilmemiş ve süresi geçmiş ödevlerde davranışını tanımlamıyor. Kendi
 * hesabımız tek kaynak; `gecKaydi` yalnızca raporlama için taşınır.
 */
export function gorunum(odev: Odev, teslim: Teslim | undefined, simdiUtc: number): Gorunum {
  if (teslim?.verilenPuan != null) return 'not';
  if (teslim && !TESLIM_EDILMEDI.has(teslim.durum)) return 'teslim';
  if (teslim?.teslimEdildiMi) return 'teslim';

  if (odev.sonTeslimUtc != null && odev.sonTeslimUtc < simdiUtc) return 'eksik';
  return 'bekliyor';
}

/**
 * Ödev "eksik" sayılıyor mu.
 *
 * Taslak, silinmiş ve teslim tarihi olmayan ödevler asla eksik olmaz:
 * son teslim anı yoksa geçilecek bir sınır da yoktur.
 */
export function eksikMi(odev: Odev, teslim: Teslim | undefined, simdiUtc: number): boolean {
  if (odev.durum !== 'PUBLISHED') return false;
  if (odev.silindiMi) return false;
  if (odev.sonTeslimUtc == null) return false;
  return gorunum(odev, teslim, simdiUtc) === 'eksik';
}

/** Takvim hücresinde tek bir nokta gösterilir; en kritik durum kazanır. */
const ONCELIK: Record<Gorunum, number> = { eksik: 3, bekliyor: 2, not: 1, teslim: 1 };

export type Nokta = 'eksik' | 'bekliyor' | 'tamam' | null;

/** Bir günün ödevlerinden takvim noktasını üretir. */
export function gunNoktasi(gorunumler: readonly Gorunum[]): Nokta {
  if (gorunumler.length === 0) return null;
  let enIyi: Gorunum = 'teslim';
  for (const g of gorunumler) if (ONCELIK[g] > ONCELIK[enIyi]) enIyi = g;
  if (enIyi === 'eksik') return 'eksik';
  if (enIyi === 'bekliyor') return 'bekliyor';
  return 'tamam';
}

// --- Takip öncesi --------------------------------------------------------

/**
 * Bir gün, takip başlamadan önceye mi düşüyor.
 *
 * Önemi: `submissionHistory` yalnızca hâlâ duran ödevlerin geçmişini verir.
 * Takip başlamadan önce silinen ödevler hiçbir yerde görünmez, dolayısıyla o
 * dönem için "eksik yoktu" denemez. Takvim bu günleri taralı gösterir.
 */
export function takipOncesiMi(gun: string, ilkTaramaUtc: number | null): boolean {
  if (ilkTaramaUtc == null) return false;
  return trGunBasiUtc(gun) < trGunBasiUtc(trGunu(ilkTaramaUtc));
}
