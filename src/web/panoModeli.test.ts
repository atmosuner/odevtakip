import { describe, it, expect } from 'vitest';
import { panoProplari, tamlayan, basHarfler, type GorunumDurumu, type Eylemler } from './panoModeli';
import { ornekVeri, ORNEK_BUGUN } from './ornekVeri';
import type { PanoVerisi } from './tipler';

const bos = () => {};
const eylem: Eylemler = {
  cocukSec: bos, gunSec: bos, ayKaydir: bos, filtreSec: bos,
  sheetAc: bos, sheetKapat: bos, tazele: bos,
};

const durum = (uzer: Partial<GorunumDurumu> = {}): GorunumDurumu => ({
  seciliCocuk: 0, gosterilenAy: null, seciliGun: null,
  filtre: null, sheetAcik: false, masaustu: false,
  ...uzer,
});

const props = (veri: PanoVerisi, d: Partial<GorunumDurumu> = {}) =>
  panoProplari(veri, durum(d), eylem, ORNEK_BUGUN);

describe('tamlayan — Türkçe tamlayan eki', () => {
  it('ünsüzle biten adlarda son ünlüye uyar', () => {
    expect(tamlayan('Ahmet')).toBe('Ahmet’in');
    expect(tamlayan('Zeynep')).toBe('Zeynep’in');
    expect(tamlayan('Burak')).toBe('Burak’ın');
    expect(tamlayan('Oğuz')).toBe('Oğuz’un');
    expect(tamlayan('Gökçen')).toBe('Gökçen’in');
  });

  it('ünlüyle biten adlarda kaynaştırma harfi ekler', () => {
    expect(tamlayan('Defne')).toBe('Defne’nin');
    expect(tamlayan('Ayşe')).toBe('Ayşe’nin');
    expect(tamlayan('Mustafa')).toBe('Mustafa’nın');
  });
});

describe('basHarfler', () => {
  it('tek adda tek harf', () => expect(basHarfler('Ahmet')).toBe('A'));
  it('çift adda iki harf', () => expect(basHarfler('Mehmet Ali')).toBe('MA'));
  it('üç adda ilk ikisi', () => expect(basHarfler('Ali Osman Yılmaz')).toBe('AO'));
  it('Türkçe büyütme kuralına uyar', () => expect(basHarfler('ilker')).toBe('İ'));
});

describe('durum bandı', () => {
  it('tek çocukta en eski gecikmeyi söyler', () => {
    const p = props(ornekVeri(1));
    expect(p.bandBaslik).toBe('2 eksik ödev');
    expect(p.bandAlt).toBe('En eskisinin teslim tarihi 5 gün önceydi');
    expect(p.bandTek).toBe(true);
  });

  it('çoklu çocukta kimin kaç eksiği olduğunu sayar', () => {
    const p = props(ornekVeri(2));
    expect(p.bandBaslik).toBe('3 eksik ödev');
    expect(p.bandAlt).toBe('Ahmet 2 · Zeynep 1');
  });

  it('eksiği olmayan çocuk bandın alt metninde yer almaz', () => {
    const p = props(ornekVeri(4));
    expect(p.bandBaslik).toBe('6 eksik ödev');
    expect(p.bandAlt).not.toContain('Mehmet Ali');   // eksiği yok
    expect(p.bandAlt).toBe('Ahmet 2 · Zeynep 1 · Defne 3');
  });

  it('band çipleri her çocuğu gösterir, eksiği olmayanı da', () => {
    const p = props(ornekVeri(4));
    expect(p.bandCocuklar.map((c) => c.ad))
      .toEqual(['Ahmet', 'Zeynep', 'Mehmet Ali', 'Defne']);
    expect(p.bandCocuklar[2]!.metin).toBe('Eksik yok');
  });

  it('ilk tarama beklenirken veri yok mesajı', () => {
    const p = props(ornekVeri(2, { durum: 'veri-yok' }));
    expect(p.bandBaslik).toBe('Henüz veri yok');
    expect(p.bandCipler).toBe(false);
    expect(p.bandZemin).toBe('var(--yuzey)');
  });

  it('eksik varsa band uyarı zeminine geçer', () => {
    expect(props(ornekVeri(2)).bandZemin).toBe('var(--renk-eksik-zemin)');
  });
});

describe('eksik listesi', () => {
  it('en eski gecikme en üstte', () => {
    const p = props(ornekVeri(2));
    expect(p.eksikSatirlar.map((r) => r.gec)).toEqual([5, 2, 1]);
  });

  it('çoklu çocukta satır kimin olduğunu belirtir', () => {
    const p = props(ornekVeri(2));
    expect(p.eksikSatirlar[0]!.ust).toBe('Ahmet · İngilizce');
  });

  it('tek çocukta ad öneki konmaz', () => {
    const p = props(ornekVeri(1));
    expect(p.eksikSatirlar[0]!.ust).toBe('İngilizce');
  });

  it('çocuk filtresi listeyi daraltır', () => {
    const p = props(ornekVeri(2), { filtre: 1 });
    expect(p.eksikSatirlar).toHaveLength(1);
    expect(p.eksikSatirlar[0]!.ust).toBe('Zeynep · Matematik');
  });

  it('filtre şeridi yalnızca eksiği olan çocukları listeler', () => {
    const p = props(ornekVeri(4));
    expect(p.filtreler.map((f) => f.ad))
      .toEqual(['Tümü · 6', 'Ahmet · 2', 'Zeynep · 1', 'Defne · 3']);
  });

  it('tek çocukta filtre şeridi gizlenir', () => {
    expect(props(ornekVeri(1)).filtreGoster).toBe(false);
  });
});

describe('takvim', () => {
  it('Eylül 2026 Salı başlar; önünde bir boş hücre olur', () => {
    const k = props(ornekVeri(1)).kolonlar[0]!;
    expect(k.ayBaslik).toBe('Eylül 2026');
    expect(k.hucreler.filter((h) => h.bos)).toHaveLength(1);
    expect(k.hucreler.filter((h) => h.dolu)).toHaveLength(30);
  });

  it('takip başlangıcından önceki günler taralı', () => {
    const k = props(ornekVeri(1)).kolonlar[0]!;
    const dolu = k.hucreler.filter((h) => h.dolu);
    const tarali = (g: number) =>
      dolu[g - 1]!.stil!.background === 'var(--tarama)';
    expect(tarali(7)).toBe(true);    // 8 Eylül'den önce
    expect(tarali(8)).toBe(false);   // ilk tarama günü
    expect(tarali(9)).toBe(false);
  });

  it('eksik olan güne elmas, teslim edilene daire düşer', () => {
    const dolu = props(ornekVeri(1)).kolonlar[0]!.hucreler.filter((h) => h.dolu);
    expect(dolu[23]!.eksik).toBe(true);     // 24 Eylül — İngilizce eksik
    expect(dolu[24]!.tamam).toBe(true);     // 25 Eylül — Türkçe teslim
    expect(dolu[29]!.bekliyor).toBe(true);  // 30 Eylül — Sosyal Bilgiler bekliyor
  });

  it('ödevi olmayan günde nokta yoktur', () => {
    const dolu = props(ornekVeri(1)).kolonlar[0]!.hucreler.filter((h) => h.dolu);
    const g1 = dolu[0]!;
    expect(g1.eksik || g1.bekliyor || g1.tamam).toBe(false);
  });

  it('takip ayında uyarı notu görünür', () => {
    const k = props(ornekVeri(1)).kolonlar[0]!;
    expect(k.takipVar).toBe(true);
    expect(k.takipNotu).toContain('8 Eylül');
  });

  it('takipten sonraki ayda not görünmez', () => {
    const k = props(ornekVeri(1), { gosterilenAy: { yil: 2026, ay: 9 } }).kolonlar[0]!;
    expect(k.takipVar).toBe(false);
  });

  it('takipten önceki ayda farklı not görünür', () => {
    const k = props(ornekVeri(1), { gosterilenAy: { yil: 2026, ay: 7 } }).kolonlar[0]!;
    expect(k.takipNotu).toContain('takip başlamadan önceydi');
  });

  it('masaüstünde her çocuk için bir sütun olur', () => {
    expect(props(ornekVeri(3), { masaustu: true }).kolonlar).toHaveLength(3);
    expect(props(ornekVeri(3)).kolonlar).toHaveLength(1);
  });

  it('teslim tarihi olmayan ödev ayrı listede toplanır', () => {
    const k = props(ornekVeri(1)).kolonlar[0]!;
    expect(k.tarihsizVar).toBe(true);
    expect(k.tarihsiz.map((s) => s.ust)).toEqual(['Din Kültürü ve Ahlak Bilgisi']);
  });
});

describe('veri tazeliği', () => {
  it('12 dakika önce güncellenmiş veri uyarı değildir', () => {
    const p = props(ornekVeri(1));
    expect(p.tazelikMetin).toBe('Güncellendi 12 dk önce');
    expect(p.tazelikUyari).toBe(false);
  });

  it('2 saatten eski veri uyarıya döner', () => {
    const v = ornekVeri(1, { sonGuncellemeUtc: ORNEK_BUGUN - 3 * 3_600_000 });
    const p = props(v);
    expect(p.tazelikMetin).toBe('3 saat önce güncellendi · yenileme gecikti');
    expect(p.tazelikUyari).toBe(true);
  });

  it('çevrimdışıyken son verinin saatini söyler', () => {
    const p = props(ornekVeri(1, { durum: 'cevrimdisi' }));
    expect(p.tazelikUyari).toBe(true);
    expect(p.tazelikMetin).toMatch(/^Çevrimdışı · \d{2}:\d{2} verisi gösteriliyor$/);
  });

  it('yüklenirken uyarı gösterilmez', () => {
    const p = props(ornekVeri(1, { durum: 'yukleniyor' }));
    expect(p.tazelikMetin).toBe('Yükleniyor…');
    expect(p.tazelikUyari).toBe(false);
  });
});

describe('çocuk seçici', () => {
  it('tek çocukta alt raf gizlenir', () => {
    expect(props(ornekVeri(1)).dockA).toBe(false);
  });

  it('çoklu çocukta alt raf açılır ve alt boşluk büyür', () => {
    const p = props(ornekVeri(2));
    expect(p.dockA).toBe(true);
    expect(p.altBosluk).toBe('112px');
  });

  it('masaüstünde alt raf gizlenir', () => {
    expect(props(ornekVeri(2), { masaustu: true }).dockA).toBe(false);
  });

  it('her çocuk farklı renk alır', () => {
    const renkler = props(ornekVeri(4)).dock.map((d) => d.renk);
    expect(new Set(renkler).size).toBe(4);
  });

  it('bağlantısı kopuk çocuk aria metninde belirtilir', () => {
    const v = ornekVeri(2);
    v.cocuklar[1] = { ...v.cocuklar[1]!, baglantiKopuk: true };
    const p = props(v);
    expect(p.dock[1]!.aria).toContain('bağlantı koptu');
    expect(p.dock[0]!.aria).not.toContain('bağlantı koptu');
  });
});

describe('sahte cihaz çubuğu', () => {
  it('varsayılan olarak kapalıdır', () => {
    expect(props(ornekVeri(1)).telefon).toBe(false);
  });

  it('açıkça istenirse gösterilir', () => {
    expect(props(ornekVeri(1), { sahteCihazCubugu: true }).telefon).toBe(true);
  });

  it('masaüstünde istense de gösterilmez', () => {
    expect(props(ornekVeri(1), { sahteCihazCubugu: true, masaustu: true }).telefon).toBe(false);
  });
});

describe('boş durumlar', () => {
  it('çocuk yokken içerik gizlenir', () => {
    const p = props(ornekVeri(0, { durum: 'cocuk-yok' }));
    expect(p.cocukYok).toBe(true);
    expect(p.icerik).toBe(false);
    expect(p.kolonlar).toHaveLength(0);
  });

  it('yüklenirken iskelet hücreleri verilir', () => {
    const p = props(ornekVeri(2, { durum: 'yukleniyor' }));
    expect(p.yukleniyor).toBe(true);
    expect(p.iskelet).toHaveLength(35);
  });
});

describe('hane adı', () => {
  it('panoya taşınır', () => {
    expect(props(ornekVeri(2)).haneAdi).toBe('Üner Ailesi');
  });

  it('boş hane adı boş geçer, uydurulmaz', () => {
    expect(props(ornekVeri(1, { haneAdi: '' })).haneAdi).toBe('');
  });
});
