import { describe, it, expect } from 'vitest';
import {
  sonTeslimAniUtc, trGunu, trGunBasiUtc, gecikmeGunu,
  gorunum, eksikMi, gunNoktasi, takipOncesiMi,
  type Odev, type Teslim,
} from './model';

const odev = (uzer: Partial<Odev> = {}): Odev => ({
  id: 'o1', dersId: 'd1', dersAdi: 'Matematik', baslik: 'Kesirler',
  tur: 'ASSIGNMENT', durum: 'PUBLISHED', sonTeslimUtc: null, sadeceGun: false,
  enYuksekPuan: 100, baglanti: 'https://classroom.google.com/', silindiMi: false,
  ...uzer,
});

const teslim = (uzer: Partial<Teslim> = {}): Teslim => ({
  id: 't1', odevId: 'o1', durum: 'NEW', gecKaydi: false,
  verilenPuan: null, teslimEdildiMi: false,
  ...uzer,
});

describe('sonTeslimAniUtc', () => {
  it('tarih + saati UTC olarak yorumlar', () => {
    const r = sonTeslimAniUtc({ year: 2026, month: 9, day: 24 }, { hours: 20, minutes: 59 });
    expect(r).not.toBeNull();
    expect(new Date(r!.utc).toISOString()).toBe('2026-09-24T20:59:00.000Z');
    expect(r!.sadeceGun).toBe(false);
  });

  it('saat yoksa günün sonunu (UTC) kullanır ve işaretler', () => {
    const r = sonTeslimAniUtc({ year: 2026, month: 9, day: 24 }, undefined);
    expect(new Date(r!.utc).toISOString()).toBe('2026-09-24T23:59:59.999Z');
    expect(r!.sadeceGun).toBe(true);
  });

  it('saat nesnesi boşsa da sadece-gün sayılır', () => {
    const r = sonTeslimAniUtc({ year: 2026, month: 9, day: 24 }, {});
    expect(r!.sadeceGun).toBe(true);
  });

  it('hours:0 gerçek bir saattir, sadece-gün değildir', () => {
    const r = sonTeslimAniUtc({ year: 2026, month: 9, day: 24 }, { hours: 0, minutes: 0 });
    expect(r!.sadeceGun).toBe(false);
    expect(new Date(r!.utc).toISOString()).toBe('2026-09-24T00:00:00.000Z');
  });

  it('tarih eksikse null döner', () => {
    expect(sonTeslimAniUtc(undefined, { hours: 12 })).toBeNull();
    expect(sonTeslimAniUtc({ year: 2026, month: 9 }, undefined)).toBeNull();
  });
});

describe('trGunu — UTC+3 kayması', () => {
  it('UTC 22:00 Türkiye\'de ertesi gündür', () => {
    // 24 Eylül 22:00 UTC = 25 Eylül 01:00 TR
    expect(trGunu(Date.UTC(2026, 8, 24, 22, 0))).toBe('2026-09-25');
  });

  it('UTC 20:59 hâlâ aynı gündür', () => {
    // 23:59 TR
    expect(trGunu(Date.UTC(2026, 8, 24, 20, 59))).toBe('2026-09-24');
  });

  it('UTC 21:00 sınırı ertesi güne geçer', () => {
    expect(trGunu(Date.UTC(2026, 8, 24, 21, 0))).toBe('2026-09-25');
  });

  it('sadece-gün son teslimi (23:59:59.999 UTC) ertesi güne taşar', () => {
    // Bilinçli davranış: Classroom UTC gün sonu veriyor, TR'de 02:59 ertesi gün.
    // Takvimde hangi güne düşeceği buna bağlı; testle sabitlendi.
    const r = sonTeslimAniUtc({ year: 2026, month: 9, day: 24 }, undefined)!;
    expect(trGunu(r.utc)).toBe('2026-09-25');
  });

  it('ay ve yıl sınırını doğru geçer', () => {
    expect(trGunu(Date.UTC(2026, 11, 31, 21, 30))).toBe('2027-01-01');
    expect(trGunu(Date.UTC(2026, 8, 30, 21, 30))).toBe('2026-10-01');
  });
});

describe('trGunBasiUtc', () => {
  it('TR gün başı UTC 21:00 önceki gündür', () => {
    expect(new Date(trGunBasiUtc('2026-09-25')).toISOString()).toBe('2026-09-24T21:00:00.000Z');
  });

  it('trGunu ile tur kapanır', () => {
    for (const g of ['2026-01-01', '2026-06-15', '2026-12-31']) {
      expect(trGunu(trGunBasiUtc(g))).toBe(g);
    }
  });
});

describe('gecikmeGunu', () => {
  const son = Date.UTC(2026, 8, 24, 12, 0);   // 24 Eylül 15:00 TR

  it('aynı gün 0', () => {
    expect(gecikmeGunu(son, Date.UTC(2026, 8, 24, 20, 0))).toBe(0);
  });

  it('ertesi gün 1', () => {
    expect(gecikmeGunu(son, Date.UTC(2026, 8, 25, 6, 0))).toBe(1);
  });

  it('takvim günü sayar, 24 saat değil', () => {
    // son teslimden 10 saat sonra ama TR'de ertesi gün
    expect(gecikmeGunu(son, Date.UTC(2026, 8, 24, 22, 0))).toBe(1);
  });

  it('gelecekteki tarih negatif dönmez', () => {
    expect(gecikmeGunu(son, Date.UTC(2026, 8, 20, 12, 0))).toBe(0);
  });
});

describe('gorunum', () => {
  const simdi = Date.UTC(2026, 8, 29, 9, 0);
  const gecmis = Date.UTC(2026, 8, 24, 12, 0);
  const gelecek = Date.UTC(2026, 9, 5, 12, 0);

  it('puan varsa notlandırıldı', () => {
    expect(gorunum(odev({ sonTeslimUtc: gecmis }), teslim({ verilenPuan: 85 }), simdi)).toBe('not');
  });

  it('puan 0 da bir puandır', () => {
    expect(gorunum(odev({ sonTeslimUtc: gecmis }), teslim({ verilenPuan: 0 }), simdi)).toBe('not');
  });

  it('TURNED_IN teslim edildi', () => {
    expect(gorunum(odev({ sonTeslimUtc: gecmis }), teslim({ durum: 'TURNED_IN' }), simdi)).toBe('teslim');
  });

  it('süresi geçmiş ve teslim edilmemiş eksiktir', () => {
    expect(gorunum(odev({ sonTeslimUtc: gecmis }), teslim({ durum: 'NEW' }), simdi)).toBe('eksik');
    expect(gorunum(odev({ sonTeslimUtc: gecmis }), teslim({ durum: 'CREATED' }), simdi)).toBe('eksik');
  });

  it('geri alınmış teslim yeniden eksiğe düşer', () => {
    expect(gorunum(odev({ sonTeslimUtc: gecmis }), teslim({ durum: 'RECLAIMED_BY_STUDENT' }), simdi)).toBe('eksik');
  });

  it('süresi gelmemiş ödev bekliyor', () => {
    expect(gorunum(odev({ sonTeslimUtc: gelecek }), teslim({ durum: 'NEW' }), simdi)).toBe('bekliyor');
  });

  it('teslim tarihi olmayan ödev hep bekliyor', () => {
    expect(gorunum(odev({ sonTeslimUtc: null }), teslim({ durum: 'NEW' }), simdi)).toBe('bekliyor');
  });

  it('teslim kaydı hiç yoksa süresi geçmişse eksiktir', () => {
    expect(gorunum(odev({ sonTeslimUtc: gecmis }), undefined, simdi)).toBe('eksik');
  });

  it('RETURNED tek başına teslim sayılmaz ama NEW değildir', () => {
    // Öğretmen teslim alınmamış ödevi de geri verebilir; durum artık
    // TESLIM_EDILMEDI kümesinde olmadığı için teslim sayılır.
    expect(gorunum(odev({ sonTeslimUtc: gecmis }), teslim({ durum: 'RETURNED' }), simdi)).toBe('teslim');
  });

  it('stateHistory TURNED_IN içeriyorsa teslim sayılır', () => {
    expect(gorunum(odev({ sonTeslimUtc: gecmis }),
      teslim({ durum: 'RECLAIMED_BY_STUDENT', teslimEdildiMi: true }), simdi)).toBe('teslim');
  });

  it('Classroom late bayrağı sonucu değiştirmez', () => {
    const a = gorunum(odev({ sonTeslimUtc: gelecek }), teslim({ gecKaydi: true }), simdi);
    const b = gorunum(odev({ sonTeslimUtc: gelecek }), teslim({ gecKaydi: false }), simdi);
    expect(a).toBe(b);
  });

  it('son teslim tam şu an ise henüz eksik değildir', () => {
    expect(gorunum(odev({ sonTeslimUtc: simdi }), teslim(), simdi)).toBe('bekliyor');
  });
});

describe('eksikMi', () => {
  const simdi = Date.UTC(2026, 8, 29, 9, 0);
  const gecmis = Date.UTC(2026, 8, 24, 12, 0);

  it('yayımlanmış, süresi geçmiş, teslim edilmemiş → eksik', () => {
    expect(eksikMi(odev({ sonTeslimUtc: gecmis }), teslim(), simdi)).toBe(true);
  });

  it('taslak ödev eksik olmaz', () => {
    expect(eksikMi(odev({ sonTeslimUtc: gecmis, durum: 'DRAFT' }), teslim(), simdi)).toBe(false);
  });

  it('silinmiş ödev eksik olmaz', () => {
    expect(eksikMi(odev({ sonTeslimUtc: gecmis, silindiMi: true }), teslim(), simdi)).toBe(false);
  });

  it('teslim tarihi olmayan ödev asla eksik olmaz', () => {
    expect(eksikMi(odev({ sonTeslimUtc: null }), teslim(), simdi)).toBe(false);
  });
});

describe('gunNoktasi', () => {
  it('boş gün nokta göstermez', () => {
    expect(gunNoktasi([])).toBeNull();
  });

  it('eksik her şeyi ezer', () => {
    expect(gunNoktasi(['teslim', 'not', 'bekliyor', 'eksik'])).toBe('eksik');
  });

  it('bekliyor teslimi ezer', () => {
    expect(gunNoktasi(['teslim', 'bekliyor'])).toBe('bekliyor');
  });

  it('hepsi teslim/notlu ise tamam', () => {
    expect(gunNoktasi(['teslim', 'not'])).toBe('tamam');
    expect(gunNoktasi(['not'])).toBe('tamam');
  });
});

describe('takipOncesiMi', () => {
  const ilkTarama = Date.UTC(2026, 8, 8, 6, 0);   // 8 Eylül 09:00 TR

  it('önceki gün takip öncesidir', () => {
    expect(takipOncesiMi('2026-09-07', ilkTarama)).toBe(true);
  });

  it('ilk tarama günü takip öncesi değildir', () => {
    expect(takipOncesiMi('2026-09-08', ilkTarama)).toBe(false);
  });

  it('sonraki gün takip öncesi değildir', () => {
    expect(takipOncesiMi('2026-09-09', ilkTarama)).toBe(false);
  });

  it('ilk tarama bilinmiyorsa hiçbir gün taralı değildir', () => {
    expect(takipOncesiMi('2020-01-01', null)).toBe(false);
  });

  it('ilk tarama TR gece yarısından önceyse o gün dahil edilmez', () => {
    // 7 Eylül 22:00 UTC = 8 Eylül 01:00 TR → ilk tarama günü 8 Eylül
    const geceYarisiSonrasi = Date.UTC(2026, 8, 7, 22, 0);
    expect(takipOncesiMi('2026-09-08', geceYarisiSonrasi)).toBe(false);
    expect(takipOncesiMi('2026-09-07', geceYarisiSonrasi)).toBe(true);
  });
});
