import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { girisBaglantisiGonder } from './eposta';

/**
 * Bu testler tek bir şeyi koruyor: giriş bağlantısı HTTP yanıtına sızmamalı.
 *
 * Geçmişte bağlantı, e-posta yapılandırılmadığında "geliştirme kolaylığı"
 * olarak yanıt gövdesinde dönüyordu ve bu davranış bir ortam değişkenine
 * bağlıydı. Değişken üretimde beklenen değerde olmadığı için herhangi biri
 * herhangi bir adresi POST edip o hesaba giriş bağlantısı alabiliyordu.
 *
 * Kural: dönüş değeri hiçbir koşulda bağlantı içermez.
 */
describe('girisBaglantisiGonder — bağlantı sızıntısı', () => {
  const BAGLANTI = 'https://ornek.test/api/dogrula?bilet=GIZLI_BILET_DEGERI';
  const eskiOrtam = { ...process.env };

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...eskiOrtam };
    vi.restoreAllMocks();
  });

  /** Dönen nesnenin hiçbir alanında bilet geçmemeli. */
  const sizintiVarMi = (sonuc: object) =>
    JSON.stringify(sonuc).includes('GIZLI_BILET_DEGERI');

  it('e-posta yapılandırılmamışken bağlantı döndürmez', async () => {
    delete process.env['RESEND_ANAHTAR'];
    delete process.env['EPOSTA_GONDEREN'];

    const sonuc = await girisBaglantisiGonder('deneme@example.com', BAGLANTI);

    expect(sizintiVarMi(sonuc)).toBe(false);
    expect(sonuc).toEqual({ gonderildi: false });
  });

  it('NETLIFY_ORTAM ne olursa olsun bağlantı döndürmez', async () => {
    delete process.env['RESEND_ANAHTAR'];
    delete process.env['EPOSTA_GONDEREN'];

    for (const ortam of ['gelistirme', 'uretim', 'test', '']) {
      process.env['NETLIFY_ORTAM'] = ortam;
      const sonuc = await girisBaglantisiGonder('deneme@example.com', BAGLANTI);
      expect(sizintiVarMi(sonuc), `ortam=${ortam}`).toBe(false);
    }
  });

  it('yapılandırma eksikken bağlantıyı sunucu günlüğüne yazar', async () => {
    delete process.env['RESEND_ANAHTAR'];
    delete process.env['EPOSTA_GONDEREN'];

    await girisBaglantisiGonder('deneme@example.com', BAGLANTI);

    // Günlük sunucu tarafında kalır; ilk kurulumda buradan okunur.
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('GIZLI_BILET_DEGERI'));
  });

  it('yalnızca anahtar varsa, gönderen yoksa yine döndürmez', async () => {
    process.env['RESEND_ANAHTAR'] = 're_sahte';
    delete process.env['EPOSTA_GONDEREN'];

    const sonuc = await girisBaglantisiGonder('deneme@example.com', BAGLANTI);
    expect(sizintiVarMi(sonuc)).toBe(false);
  });

  it('gönderim başarılıysa da bağlantı döndürmez', async () => {
    process.env['RESEND_ANAHTAR'] = 're_sahte';
    process.env['EPOSTA_GONDEREN'] = 'Ödev Defteri <giris@ornek.test>';

    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response('{"id":"1"}', { status: 200 })));

    const sonuc = await girisBaglantisiGonder('deneme@example.com', BAGLANTI);

    expect(sonuc).toEqual({ gonderildi: true });
    expect(sizintiVarMi(sonuc)).toBe(false);
  });

  it('Resend hata verirse istisna fırlatır, sessizce geçmez', async () => {
    process.env['RESEND_ANAHTAR'] = 're_sahte';
    process.env['EPOSTA_GONDEREN'] = 'Ödev Defteri <giris@ornek.test>';

    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response('{"message":"invalid api key"}', { status: 401 })));

    await expect(girisBaglantisiGonder('deneme@example.com', BAGLANTI))
      .rejects.toThrow(/E-posta gönderilemedi/);
  });
});
