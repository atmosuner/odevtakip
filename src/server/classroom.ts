// Google Classroom API sarmalayıcısı.
//
// Çıplak fetch kullanılıyor: `googleapis` paketi onlarca MB ve bize üç uç
// nokta lazım. Netlify Scheduled Functions'ın 30 saniye sınırında soğuk
// başlatma süresi önemli.
//
// İki optimizasyon dokümantasyonun kendi önerisi:
//   - `fields` ile kısmi cevap: `description` ve `materials` ağır, bize gerekmiyor.
//   - `courseWorkId="-"` ile bir dersin tüm teslimleri tek çağrıda gelir (N+1 yok).

import { GeciciGoogleHatasi, YenidenIzinGerekli } from './google';
import type { ClassroomTarih, ClassroomSaat } from '../model';

const TABAN = 'https://classroom.googleapis.com/v1';

// --- API biçimleri (yalnızca kullandığımız alanlar) ----------------------

export interface ApiDers {
  id: string;
  name: string;
  section?: string;
  courseState: string;
  alternateLink: string;
}

export interface ApiOdev {
  id: string;
  courseId: string;
  title: string;
  workType?: string;
  state?: string;
  maxPoints?: number;
  dueDate?: ClassroomTarih;
  dueTime?: ClassroomSaat;
  topicId?: string;
  alternateLink: string;
  creationTime?: string;
  updateTime?: string;
}

export interface ApiDurumGecmisi {
  state?: string;
  stateTimestamp?: string;
  actorUserId?: string;
}

export interface ApiPuanGecmisi {
  gradeTimestamp?: string;
  pointsEarned?: number;
  maxPoints?: number;
  gradeChangeType?: string;
  actorUserId?: string;
}

export interface ApiTeslim {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId?: string;
  state?: string;
  late?: boolean;
  assignedGrade?: number;
  updateTime?: string;
  submissionHistory?: { stateHistory?: ApiDurumGecmisi; gradeHistory?: ApiPuanGecmisi }[];
}

// --- İstek katmanı -------------------------------------------------------

/** Sayfalanmış bir listeyi baştan sona toplar. */
async function tumSayfalar<T>(
  erisimBelirteci: string,
  yol: string,
  sorgu: Record<string, string>,
  alan: string,
): Promise<T[]> {
  const toplam: T[] = [];
  let sayfaBelirteci: string | undefined;

  // Sonsuz döngüye karşı üst sınır: 50 sayfa × 100 kayıt fazlasıyla yeter.
  for (let sayfa = 0; sayfa < 50; sayfa++) {
    const p = new URLSearchParams({ ...sorgu, pageSize: '100' });
    if (sayfaBelirteci) p.set('pageToken', sayfaBelirteci);

    const cevap = await istek(erisimBelirteci, `${yol}?${p}`);
    const dilim = cevap[alan];
    if (Array.isArray(dilim)) toplam.push(...(dilim as T[]));

    sayfaBelirteci = typeof cevap['nextPageToken'] === 'string'
      ? cevap['nextPageToken'] : undefined;
    if (!sayfaBelirteci) break;
  }
  return toplam;
}

async function istek(
  erisimBelirteci: string,
  yol: string,
): Promise<Record<string, unknown>> {
  let cevap: Response;
  try {
    cevap = await fetch(`${TABAN}${yol}`, {
      headers: { authorization: `Bearer ${erisimBelirteci}` },
    });
  } catch (e) {
    throw new GeciciGoogleHatasi(`Classroom'a ulaşılamadı: ${(e as Error).message}`);
  }

  if (cevap.ok) return await cevap.json() as Record<string, unknown>;

  const metin = await cevap.text();

  // 401/403: yetki gitti — çocuğun erişimi iptal ettiği anlamına gelir.
  if (cevap.status === 401 || cevap.status === 403) {
    throw new YenidenIzinGerekli(`Classroom ${cevap.status}: ${metin.slice(0, 160)}`);
  }
  // 429/5xx: kota ya da sunucu; sonraki taramada düzelir.
  throw new GeciciGoogleHatasi(
    `Classroom ${cevap.status}: ${metin.slice(0, 160)}`, cevap.status);
}

// --- Uç noktalar ---------------------------------------------------------

/** Öğrencinin üyesi olduğu aktif dersler. */
export function dersleriListele(erisimBelirteci: string): Promise<ApiDers[]> {
  return tumSayfalar<ApiDers>(erisimBelirteci, '/courses', {
    courseStates: 'ACTIVE',
    studentId: 'me',
    fields: 'courses(id,name,section,courseState,alternateLink),nextPageToken',
  }, 'courses');
}

/**
 * Bir dersin ödevleri.
 *
 * `description` ve `materials` kasıtlı olarak istenmiyor: liste çağrılarının
 * en ağır alanları bunlar ve panoda kullanılmıyorlar.
 */
export function odevleriListele(
  erisimBelirteci: string, dersId: string,
): Promise<ApiOdev[]> {
  return tumSayfalar<ApiOdev>(
    erisimBelirteci, `/courses/${encodeURIComponent(dersId)}/courseWork`, {
      fields: 'courseWork(id,courseId,title,workType,state,maxPoints,dueDate,' +
        'dueTime,topicId,alternateLink,creationTime,updateTime),nextPageToken',
    }, 'courseWork');
}

/**
 * Bir dersteki TÜM ödevlerin kendi teslimleri.
 *
 * `courseWorkId` yerine `-` verilmesi Classroom'un desteklediği bir kısayol:
 * ders başına tek çağrı yeter, ödev başına ayrı istek gerekmez.
 */
export function teslimleriListele(
  erisimBelirteci: string, dersId: string,
): Promise<ApiTeslim[]> {
  return tumSayfalar<ApiTeslim>(
    erisimBelirteci,
    `/courses/${encodeURIComponent(dersId)}/courseWork/-/studentSubmissions`, {
      userId: 'me',
      fields: 'studentSubmissions(id,courseId,courseWorkId,userId,state,late,' +
        'assignedGrade,updateTime,submissionHistory),nextPageToken',
    }, 'studentSubmissions');
}

/** Bir çocuğun tüm derslerini ve teslimlerini paralel tarar. */
export interface TaramaCiktisi {
  dersler: ApiDers[];
  odevler: Map<string, ApiOdev[]>;     // dersId → ödevler
  teslimler: Map<string, ApiTeslim[]>; // dersId → teslimler
}

export async function tumunuTara(erisimBelirteci: string): Promise<TaramaCiktisi> {
  const dersler = await dersleriListele(erisimBelirteci);

  // Dersler paralel taranır: 30 saniye sınırında sıralı çağrı israf olur.
  const sonuclar = await Promise.all(dersler.map(async (d) => ({
    dersId: d.id,
    odevler: await odevleriListele(erisimBelirteci, d.id),
    teslimler: await teslimleriListele(erisimBelirteci, d.id),
  })));

  return {
    dersler,
    odevler: new Map(sonuclar.map((s) => [s.dersId, s.odevler])),
    teslimler: new Map(sonuclar.map((s) => [s.dersId, s.teslimler])),
  };
}
