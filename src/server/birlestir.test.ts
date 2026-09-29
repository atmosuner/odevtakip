import { describe, it, expect } from 'vitest';
import { veriyiBirlestir, olaylariCikar, olaylariBirlestir } from './birlestir';
import type { ApiDers, ApiOdev, ApiTeslim, TaramaCiktisi } from './classroom';
import type { CocukVerisi } from './sema';

const SIMDI = Date.UTC(2026, 8, 29, 6, 0);
const ONCE = Date.UTC(2026, 8, 22, 6, 0);

const ders = (id: string, ad: string): ApiDers => ({
  id, name: ad, courseState: 'ACTIVE',
  alternateLink: `https://classroom.google.com/c/${id}`,
});

const odev = (id: string, dersId: string, uzer: Partial<ApiOdev> = {}): ApiOdev => ({
  id, courseId: dersId, title: `Ödev ${id}`,
  workType: 'ASSIGNMENT', state: 'PUBLISHED', maxPoints: 100,
  alternateLink: `https://classroom.google.com/c/${dersId}/a/${id}`,
  ...uzer,
});

const teslim = (id: string, odevId: string, uzer: Partial<ApiTeslim> = {}): ApiTeslim => ({
  id, courseId: 'd1', courseWorkId: odevId, state: 'NEW', late: false, ...uzer,
});

const tarama = (
  dersler: ApiDers[],
  odevler: Record<string, ApiOdev[]>,
  teslimler: Record<string, ApiTeslim[]> = {},
): TaramaCiktisi => ({
  dersler,
  odevler: new Map(Object.entries(odevler)),
  teslimler: new Map(Object.entries(teslimler)),
});

describe('veriyiBirlestir — ilk tarama', () => {
  const t = tarama([ders('d1', 'Matematik')], {
    d1: [odev('o1', 'd1', { dueDate: { year: 2026, month: 9, day: 24 }, dueTime: { hours: 20, minutes: 59 } })],
  }, { d1: [teslim('t1', 'o1')] });

  it('ders adını ödeve taşır', () => {
    const v = veriyiBirlestir('c1', t, null, SIMDI);
    expect(v.odevler[0]!.dersAdi).toBe('Matematik');
  });

  it('son teslim anını UTC olarak çözer', () => {
    const v = veriyiBirlestir('c1', t, null, SIMDI);
    expect(new Date(v.odevler[0]!.sonTeslimUtc!).toISOString())
      .toBe('2026-09-24T20:59:00.000Z');
    expect(v.odevler[0]!.sadeceGun).toBe(false);
  });

  it('ilk görülme ve son görülme aynı olur', () => {
    const v = veriyiBirlestir('c1', t, null, SIMDI);
    expect(v.odevler[0]!.ilkGorulmeUtc).toBe(SIMDI);
    expect(v.odevler[0]!.sonGorulmeUtc).toBe(SIMDI);
    expect(v.odevler[0]!.silinmeUtc).toBeNull();
  });
});

describe('veriyiBirlestir — silinen ödev', () => {
  const ilk = veriyiBirlestir('c1',
    tarama([ders('d1', 'Matematik')], { d1: [odev('o1', 'd1'), odev('o2', 'd1')] }),
    null, ONCE);

  it('kaybolan ödev silinmez, işaretlenir', () => {
    const ikinci = veriyiBirlestir('c1',
      tarama([ders('d1', 'Matematik')], { d1: [odev('o1', 'd1')] }),
      ilk, SIMDI);

    expect(ikinci.odevler).toHaveLength(2);
    const o2 = ikinci.odevler.find((o) => o.id === 'o2')!;
    expect(o2.silinmeUtc).toBe(SIMDI);
    expect(o2.baslik).toBe('Ödev o2');   // içerik korunur
  });

  it('ikinci kez kaybolursa silinme anı değişmez', () => {
    const ikinci = veriyiBirlestir('c1',
      tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }), ilk, SIMDI);
    const ucuncu = veriyiBirlestir('c1',
      tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }), ikinci, SIMDI + 86_400_000);

    expect(ucuncu.odevler.find((o) => o.id === 'o2')!.silinmeUtc).toBe(SIMDI);
  });

  it('geri gelen ödevin silinme işareti kalkar', () => {
    const ikinci = veriyiBirlestir('c1',
      tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }), ilk, SIMDI);
    const ucuncu = veriyiBirlestir('c1',
      tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1'), odev('o2', 'd1')] }),
      ikinci, SIMDI + 86_400_000);

    expect(ucuncu.odevler.find((o) => o.id === 'o2')!.silinmeUtc).toBeNull();
  });

  it('ilk görülme anı korunur', () => {
    const ikinci = veriyiBirlestir('c1',
      tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }), ilk, SIMDI);
    expect(ikinci.odevler.find((o) => o.id === 'o1')!.ilkGorulmeUtc).toBe(ONCE);
    expect(ikinci.odevler.find((o) => o.id === 'o1')!.sonGorulmeUtc).toBe(SIMDI);
  });
});

describe('veriyiBirlestir — teslim durumu', () => {
  it('stateHistory TURNED_IN içeriyorsa işaretlenir', () => {
    const t = tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }, {
      d1: [teslim('t1', 'o1', {
        state: 'RECLAIMED_BY_STUDENT',
        submissionHistory: [
          { stateHistory: { state: 'CREATED', stateTimestamp: '2026-09-20T10:00:00Z' } },
          { stateHistory: { state: 'TURNED_IN', stateTimestamp: '2026-09-23T08:00:00Z' } },
        ],
      })],
    });
    const v = veriyiBirlestir('c1', t, null, SIMDI);
    expect(v.teslimler[0]!.teslimEdildiMi).toBe(true);
  });

  it('TURNED_IN hiç yoksa işaretlenmez', () => {
    const t = tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }, {
      d1: [teslim('t1', 'o1', {
        submissionHistory: [{ stateHistory: { state: 'CREATED', stateTimestamp: '2026-09-20T10:00:00Z' } }],
      })],
    });
    expect(veriyiBirlestir('c1', t, null, SIMDI).teslimler[0]!.teslimEdildiMi).toBe(false);
  });

  it('Classroom late bayrağı taşınır ama yorumlanmaz', () => {
    const t = tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }, {
      d1: [teslim('t1', 'o1', { late: true })],
    });
    expect(veriyiBirlestir('c1', t, null, SIMDI).teslimler[0]!.gecKaydi).toBe(true);
  });
});

describe('olaylariCikar', () => {
  const t = tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }, {
    d1: [teslim('t1', 'o1', {
      submissionHistory: [
        { stateHistory: { state: 'CREATED', stateTimestamp: '2026-09-20T10:00:00Z', actorUserId: 'u1' } },
        { stateHistory: { state: 'TURNED_IN', stateTimestamp: '2026-09-23T08:00:00Z', actorUserId: 'u1' } },
        { gradeHistory: { gradeTimestamp: '2026-09-25T14:00:00Z', pointsEarned: 85, maxPoints: 100, actorUserId: 'ogr' } },
      ],
    })],
  });

  it('durum ve puan olaylarını ayırır', () => {
    const o = olaylariCikar(t);
    expect(o.filter((x) => x.tur === 'durum')).toHaveLength(2);
    expect(o.filter((x) => x.tur === 'puan')).toHaveLength(1);
  });

  it('puan olayında değerleri taşır', () => {
    const p = olaylariCikar(t).find((x) => x.tur === 'puan')!;
    expect(p.puan).toBe(85);
    expect(p.enYuksekPuan).toBe(100);
    expect(p.aktorId).toBe('ogr');
    expect(new Date(p.zamanUtc).toISOString()).toBe('2026-09-25T14:00:00.000Z');
  });

  it('zaman damgası olmayan kayıt atlanır', () => {
    const bozuk = tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }, {
      d1: [teslim('t1', 'o1', { submissionHistory: [{ stateHistory: { state: 'CREATED' } }] })],
    });
    expect(olaylariCikar(bozuk)).toHaveLength(0);
  });
});

describe('olaylariBirlestir — idempotentlik', () => {
  const t = tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }, {
    d1: [teslim('t1', 'o1', {
      submissionHistory: [
        { stateHistory: { state: 'CREATED', stateTimestamp: '2026-09-20T10:00:00Z' } },
        { stateHistory: { state: 'TURNED_IN', stateTimestamp: '2026-09-23T08:00:00Z' } },
      ],
    })],
  });

  it('aynı tarama iki kez çalışsa olay sayısı artmaz', () => {
    const bir = olaylariBirlestir('c1', olaylariCikar(t), null);
    const iki = olaylariBirlestir('c1', olaylariCikar(t), bir);
    expect(bir.olaylar).toHaveLength(2);
    expect(iki.olaylar).toHaveLength(2);
  });

  it('yeni olay eklenince toplanır', () => {
    const bir = olaylariBirlestir('c1', olaylariCikar(t), null);
    const sonraki = tarama([ders('d1', 'M')], { d1: [odev('o1', 'd1')] }, {
      d1: [teslim('t1', 'o1', {
        submissionHistory: [
          { stateHistory: { state: 'CREATED', stateTimestamp: '2026-09-20T10:00:00Z' } },
          { stateHistory: { state: 'TURNED_IN', stateTimestamp: '2026-09-23T08:00:00Z' } },
          { gradeHistory: { gradeTimestamp: '2026-09-26T09:00:00Z', pointsEarned: 90, maxPoints: 100 } },
        ],
      })],
    });
    const iki = olaylariBirlestir('c1', olaylariCikar(sonraki), bir);
    expect(iki.olaylar).toHaveLength(3);
  });

  it('olaylar zaman sırasına dizilir', () => {
    const b = olaylariBirlestir('c1', olaylariCikar(t), null);
    const zamanlar = b.olaylar.map((o) => o.zamanUtc);
    expect(zamanlar).toEqual([...zamanlar].sort((a, x) => a - x));
  });

  it('puan değişirse ayrı olay olur, eskisi silinmez', () => {
    const p1 = olaylariBirlestir('c1', [{
      anahtar: 't1|puan|100|70', teslimId: 't1', odevId: 'o1', tur: 'puan',
      zamanUtc: 100, durum: null, puan: 70, enYuksekPuan: 100, aktorId: null,
    }], null);
    const p2 = olaylariBirlestir('c1', [{
      anahtar: 't1|puan|200|85', teslimId: 't1', odevId: 'o1', tur: 'puan',
      zamanUtc: 200, durum: null, puan: 85, enYuksekPuan: 100, aktorId: null,
    }], p1);
    expect(p2.olaylar.map((o) => o.puan)).toEqual([70, 85]);
  });
});

describe('şema sürümü', () => {
  it('çıktıya yazılır', () => {
    const v: CocukVerisi = veriyiBirlestir('c1', tarama([], {}), null, SIMDI);
    expect(v.sema).toBe(1);
    expect(v.cocukId).toBe('c1');
    expect(v.sonTaramaUtc).toBe(SIMDI);
  });
});
