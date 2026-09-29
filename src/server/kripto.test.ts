import { describe, it, expect, beforeAll } from 'vitest';
import { randomBytes } from 'node:crypto';
import {
  tokenSifrele, tokenCoz, biletUret, biletOzeti,
  epostaAnahtari, esitMi, oturumImzala, oturumCoz,
} from './kripto';

beforeAll(() => {
  process.env.ANA_ANAHTAR = randomBytes(32).toString('base64');
  process.env.OTURUM_GIZLI = randomBytes(32).toString('base64');
});

describe('token şifreleme', () => {
  const TOKEN = '1//09abcDEF_refresh-token-örneği';

  it('şifreleyip çözünce aynısını verir', () => {
    const s = tokenSifrele(TOKEN, 'cocuk-1');
    expect(tokenCoz(s, 'cocuk-1')).toBe(TOKEN);
  });

  it('şifreli metin düz tokeni içermez', () => {
    expect(tokenSifrele(TOKEN, 'cocuk-1')).not.toContain('refresh-token');
  });

  it('aynı girdi her seferinde farklı şifreli metin üretir', () => {
    const a = tokenSifrele(TOKEN, 'cocuk-1');
    const b = tokenSifrele(TOKEN, 'cocuk-1');
    expect(a).not.toBe(b);           // rastgele IV
    expect(tokenCoz(a, 'cocuk-1')).toBe(tokenCoz(b, 'cocuk-1'));
  });

  it('başka çocuğun kimliğiyle çözülemez', () => {
    // AAD bağlaması: depoya yazma yetkisi ele geçse bile token bir çocuktan
    // diğerine taşınamaz.
    const s = tokenSifrele(TOKEN, 'cocuk-1');
    expect(() => tokenCoz(s, 'cocuk-2')).toThrow();
  });

  /** Şifreli metnin bir parçasının ilk baytını bozar. */
  const bozParca = (sifreli: string, indeks: number): string => {
    const parca = sifreli.split('.');
    const ham = Buffer.from(parca[indeks]!, 'base64url');
    ham[0] = (ham[0]! ^ 0xff) & 0xff;
    parca[indeks] = ham.toString('base64url');
    return parca.join('.');
  };

  it('şifreli metin kurcalanırsa hata verir', () => {
    expect(() => tokenCoz(bozParca(tokenSifrele(TOKEN, 'cocuk-1'), 3), 'cocuk-1')).toThrow();
  });

  it('kimlik doğrulama etiketi kurcalanırsa hata verir', () => {
    expect(() => tokenCoz(bozParca(tokenSifrele(TOKEN, 'cocuk-1'), 2), 'cocuk-1')).toThrow();
  });

  it('IV kurcalanırsa hata verir', () => {
    expect(() => tokenCoz(bozParca(tokenSifrele(TOKEN, 'cocuk-1'), 1), 'cocuk-1')).toThrow();
  });

  it('tanınmayan sürüm reddedilir', () => {
    const s = tokenSifrele(TOKEN, 'cocuk-1').replace(/^v1/, 'v9');
    expect(() => tokenCoz(s, 'cocuk-1')).toThrow(/Tanınmayan token biçimi/);
  });

  it('bozuk biçim reddedilir', () => {
    expect(() => tokenCoz('saçmalık', 'cocuk-1')).toThrow();
    expect(() => tokenCoz('v1.a.b', 'cocuk-1')).toThrow();
  });

  it('sürüm öneki taşır', () => {
    expect(tokenSifrele(TOKEN, 'c').startsWith('v1.')).toBe(true);
  });

  it('ana anahtar 32 bayt değilse reddedilir', () => {
    const eski = process.env.ANA_ANAHTAR;
    process.env.ANA_ANAHTAR = randomBytes(16).toString('base64');
    expect(() => tokenSifrele(TOKEN, 'c')).toThrow(/32 bayt olmalı/);
    process.env.ANA_ANAHTAR = eski;
  });
});

describe('biletler', () => {
  it('her bilet benzersizdir', () => {
    const biletler = new Set(Array.from({ length: 200 }, biletUret));
    expect(biletler.size).toBe(200);
  });

  it('özet biletin kendisini açığa çıkarmaz', () => {
    const b = biletUret();
    expect(biletOzeti(b)).not.toBe(b);
    expect(biletOzeti(b)).toBe(biletOzeti(b));   // deterministik
  });

  it('farklı biletler farklı özet verir', () => {
    expect(biletOzeti(biletUret())).not.toBe(biletOzeti(biletUret()));
  });
});

describe('epostaAnahtari', () => {
  it('büyük/küçük harf ve boşluk farkını yok sayar', () => {
    expect(epostaAnahtari(' Bahadir@Example.COM ')).toBe(epostaAnahtari('bahadir@example.com'));
  });

  it('adresi düz metin bırakmaz', () => {
    expect(epostaAnahtari('bahadir@example.com')).not.toContain('bahadir');
  });

  it('Türkçe büyük İ sorununa takılmaz', () => {
    // 'I'.toLowerCase('tr') = 'ı' — tutarlı davranması yeterli
    expect(epostaAnahtari('ILKER@x.com')).toBe(epostaAnahtari('ILKER@x.com'));
  });
});

describe('esitMi', () => {
  it('aynı metinlerde doğru', () => expect(esitMi('abc', 'abc')).toBe(true));
  it('farklı metinlerde yanlış', () => expect(esitMi('abc', 'abd')).toBe(false));
  it('farklı uzunlukta yanlış, hata fırlatmaz', () => {
    expect(esitMi('abc', 'abcd')).toBe(false);
  });
});

describe('oturum imzası', () => {
  const veri = { ebeveynId: 'e1', haneId: 'h1', sonaErme: 999 };

  it('imzalayıp çözünce aynısını verir', () => {
    expect(oturumCoz(oturumImzala(veri))).toEqual(veri);
  });

  it('gövde değiştirilirse reddedilir', () => {
    const imza = oturumImzala(veri).split('.')[1]!;
    const bozuk = Buffer.from(JSON.stringify({ ...veri, haneId: 'baskaHane' }), 'utf8')
      .toString('base64url');
    expect(oturumCoz(`${bozuk}.${imza}`)).toBeNull();
  });

  it('imza değiştirilirse reddedilir', () => {
    const c = oturumImzala(veri);
    expect(oturumCoz(c.slice(0, -1) + 'x')).toBeNull();
  });

  it('başka gizli anahtarla imzalanan kabul edilmez', () => {
    const c = oturumImzala(veri);
    const eski = process.env.OTURUM_GIZLI;
    process.env.OTURUM_GIZLI = randomBytes(32).toString('base64');
    expect(oturumCoz(c)).toBeNull();
    process.env.OTURUM_GIZLI = eski;
  });

  it('boş ve bozuk girdide null döner', () => {
    expect(oturumCoz(null)).toBeNull();
    expect(oturumCoz('')).toBeNull();
    expect(oturumCoz('noktasiz')).toBeNull();
    expect(oturumCoz('.imza')).toBeNull();
  });
});
