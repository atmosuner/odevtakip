// ÜRETİLEN DOSYA — elle düzenleme. Kaynak: design/HesapEkranlari.dc.html
// Yeniden üret: npm run port
//
// Inline stiller tasarımdan birebir taşındı. Görsel fark olmaması için
// bu dosyadaki stil değerlerini değiştirme; değişiklik gerekiyorsa
// tasarım dosyasını güncelleyip dönüştürücüyü tekrar çalıştır.
/* eslint-disable */
import { Fragment } from 'react';
import type { HesapEkranlariProps } from '../tipler';

export function HesapEkranlari(p: HesapEkranlariProps) {
  const {
    adim,
    adimlar,
    ayarlarGoster,
    bosIkonlar,
    cocuk,
    cocukDegis,
    cocukIn,
    cocuklar,
    davet,
    davetDegis,
    e,
    ebeveynAdlari,
    ebeveynler,
    eposta,
    epostaDegis,
    git,
    hane,
    haneAdi,
    haneAdiDegis,
    haneAdiKaydet,
    haneDegis,
    kopyala,
    kopyalaMetin,
    kurulumUst,
    qr,
    qrBoyut,
    qrModul,
  } = p;

  return (
    <>
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--zemin)", color: "var(--murekkep)", fontFamily: "var(--yazi-aile)", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ height: "44px", flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", fontSize: "15px", fontWeight: "600" }}>
        <span>
          09:41
        </span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <div style={{ width: "17px", height: "10px", borderRadius: "2px", background: "var(--murekkep)" }} />
          <div style={{ width: "25px", height: "12px", borderRadius: "3px", border: "1.5px solid var(--murekkep)", padding: "1.5px", boxSizing: "border-box" }}>
            <div style={{ width: "72%", height: "100%", borderRadius: "1px", background: "var(--murekkep)" }} />
          </div>
        </div>
      </div>
      {e.ikon ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "28px 26px", background: "var(--yuzey-2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "28px 22px", justifyItems: "center" }}>
            {(bosIkonlar ?? []).map((x: any, _i0: number) => (
              <Fragment key={x?.key ?? _i0}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "62px", height: "62px", borderRadius: "16px", background: "var(--cizgi)" }} />
                  <div style={{ width: "40px", height: "8px", borderRadius: "4px", background: "var(--cizgi)" }} />
                </div>
              </Fragment>
            ))}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "62px", height: "62px", borderRadius: "16px", background: "oklch(0.972 0.009 85)", boxShadow: "0 1px 3px oklch(0.2 0.02 60 / 0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                <span style={{ width: "9px", height: "9px", transform: "rotate(45deg)", borderRadius: "1.5px", background: "oklch(0.6 0.13 48)" }} />
                <span style={{ width: "11px", height: "11px", borderRadius: "50%", boxShadow: "inset 0 0 0 2px oklch(0.26 0.014 60)" }} />
                <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "oklch(0.58 0.09 155)" }} />
              </div>
              <div style={{ fontSize: "12px", fontWeight: "500" }}>
                Ödev Defteri
              </div>
            </div>
          </div>
          <div style={{ marginTop: "auto", padding: "16px", borderRadius: "var(--kose-l)", background: "var(--yuzey)", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "700" }}>
              Ana ekran ikonu
            </div>
            <div style={{ fontSize: "var(--yazi-meta)", lineHeight: "1.45", color: "var(--murekkep-2)" }}>
              Üç durum şekli: eksik, bekliyor, teslim. Tam ekran (standalone) açılır; tarayıcı çubuğu yok, üstte yalnızca sistem durum çubuğu.
            </div>
          </div>
        </div>
        </>
      ) : null}
      {e.acilis ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18px", paddingBottom: "60px" }}>
          <div style={{ width: "96px", height: "96px", borderRadius: "26px", background: "var(--yuzey)", border: "1px solid var(--cizgi)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ width: "14px", height: "14px", transform: "rotate(45deg)", borderRadius: "2px", background: "var(--renk-eksik)" }} />
            <span style={{ width: "17px", height: "17px", borderRadius: "50%", boxShadow: "inset 0 0 0 3px var(--murekkep)" }} />
            <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
          </div>
          <div style={{ fontSize: "var(--yazi-baslik)", fontWeight: "700", letterSpacing: "-0.015em" }}>
            Ödev Defteri
          </div>
        </div>
        </>
      ) : null}
      {e.giris ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "8px 24px 36px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px" }}>
            <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
              <span style={{ width: "11px", height: "11px", transform: "rotate(45deg)", borderRadius: "2px", background: "var(--renk-eksik)" }} />
              <span style={{ width: "13px", height: "13px", borderRadius: "50%", boxShadow: "inset 0 0 0 2px var(--murekkep)" }} />
              <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
            </div>
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              Ödev Defteri
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)" }}>
              Çocuklarınızın Google Classroom ödevleri, tek bakışta.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--yazi-meta)", fontWeight: "600", color: "var(--murekkep-2)" }}>
              E-posta adresiniz
              <input type="email" inputMode="email" autoComplete="email" value={eposta} onChange={epostaDegis} style={{ minHeight: "52px", padding: "0 16px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "500 16px var(--yazi-aile)" }} />
            </label>
            <button onClick={git.eposta} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              Giriş bağlantısı gönder
            </button>
            <div style={{ fontSize: "var(--yazi-meta)", lineHeight: "1.45", color: "var(--murekkep-3)", textAlign: "center", textWrap: "pretty" }}>
              Parola yok. E-postanıza gelen bağlantıya dokunarak girersiniz.
            </div>
          </div>
        </div>
        </>
      ) : null}
      {e.eposta ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "8px 24px 36px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px" }}>
            <div style={{ width: "52px", height: "40px", borderRadius: "8px", border: "2px solid var(--murekkep)", boxSizing: "border-box", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "50%", top: "-22px", width: "32px", height: "32px", marginLeft: "-16px", transform: "rotate(45deg)", border: "2px solid var(--murekkep)" }} />
            </div>
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              E-postanızı kontrol edin
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
              <strong style={{ color: "var(--murekkep)" }}>
                {eposta}
              </strong>
              adresine bir giriş bağlantısı gönderdik. Bağlantıya bu telefonda dokunun; 15 dakika geçerli.
            </div>
            <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-3)" }}>
              Gelmediyse gereksiz (spam) klasörüne bakın.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={git.kurulum1} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              E-posta uygulamasını aç
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button disabled={true} style={{ flex: "1", minHeight: "48px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "transparent", color: "var(--murekkep-3)", font: "600 15px var(--yazi-aile)" }}>
                Tekrar gönder · 0:42
              </button>
              <button onClick={git.giris} style={{ flex: "1", minHeight: "48px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
                Farklı adres
              </button>
            </div>
          </div>
        </div>
        </>
      ) : null}
      {e.gecersiz ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "8px 24px 36px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", border: "2px dashed var(--murekkep-2)" }} />
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              Bu bağlantı artık geçerli değil
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
              Giriş bağlantıları 15 dakika geçerlidir ve yalnızca bir kez kullanılabilir. Yenisini gönderelim.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={git.eposta} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              {eposta} adresine yeni bağlantı gönder
            </button>
            <button onClick={git.giris} style={{ minHeight: "48px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
              Farklı adres kullan
            </button>
          </div>
        </div>
        </>
      ) : null}
      {kurulumUst ? (
        <>
        <div style={{ flex: "none", padding: "6px 24px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--yazi-meta)", fontWeight: "600", color: "var(--murekkep-2)" }}>
            <span>
              Kurulum
            </span>
            <span>
              Adım {adim} / 3
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {(adimlar ?? []).map((a: any, _i1: number) => (
              <Fragment key={a?.key ?? _i1}>
                <span style={{ flex: "1", height: "4px", borderRadius: "2px", background: `${a.renk}` }} />
              </Fragment>
            ))}
          </div>
        </div>
        </>
      ) : null}
      {e.kurulum1 ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "28px 24px 36px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              Hanenize bir ad verin
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)" }}>
              Panonun üstünde görünür. Sonra değiştirebilirsiniz.
            </div>
            <input value={hane} onChange={haneDegis} aria-label="Hane adı" style={{ marginTop: "8px", minHeight: "52px", padding: "0 16px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "500 17px var(--yazi-aile)" }} />
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={git.kurulum2} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              Devam
            </button>
            <button onClick={git.kurulum2} style={{ minHeight: "48px", borderRadius: "var(--kose-m)", border: "none", background: "transparent", color: "var(--murekkep-2)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
              Atla — “Ailem” olarak kalsın
            </button>
          </div>
        </div>
        </>
      ) : null}
      {e.kurulum2 ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "28px 24px 36px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              Bir çocuk ekleyin
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
              Şimdilik adı yeterli. Sonraki adımda çocuğunuz kendi telefonunda ya da bilgisayarında izin verecek.
            </div>
            <label style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--yazi-meta)", fontWeight: "600", color: "var(--murekkep-2)" }}>
              Çocuğun adı
              <input value={cocuk} onChange={cocukDegis} style={{ minHeight: "52px", padding: "0 16px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "500 17px var(--yazi-aile)" }} />
            </label>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={git.bagla} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              İzin bağlantısı oluştur
            </button>
          </div>
        </div>
        </>
      ) : null}
      {e.bagla ? (
        <>
        <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "22px 24px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
            {cocukIn} iznini alın
          </div>
          <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
            Google, velinin kendi hesabıyla çocuğun ödevlerini okumasına izin vermiyor; bu erişimi {cocuk} kendi hesabıyla vermeli.
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 16px 16px", borderRadius: "var(--kose-l)", background: "var(--yuzey)", border: "1px solid var(--cizgi)" }}>
            <button onClick={git.izin} aria-label="QR kod" style={{ padding: "12px", border: "none", borderRadius: "12px", background: "#fff", cursor: "pointer" }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${qrModul}, ${qrBoyut})`, gridAutoRows: `${qrBoyut}` }}>
                {(qr ?? []).map((q: any, _i2: number) => (
                  <Fragment key={q?.key ?? _i2}>
                    <span style={{ background: `${q.r}` }} />
                  </Fragment>
                ))}
              </div>
            </button>
            <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "600", textAlign: "center" }}>
              {cocuk} yanınızdaysa
            </div>
            <div style={{ fontSize: "var(--yazi-meta)", lineHeight: "1.45", color: "var(--murekkep-2)", textAlign: "center", textWrap: "pretty" }}>
              Telefonunun kamerasıyla bu kodu okutsun, açılan sayfada izin versin.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "var(--yazi-meta)", fontWeight: "600", color: "var(--murekkep-2)" }}>
              Yanınızda değilse bağlantıyı gönderin
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={{ flex: "1", minHeight: "48px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
                Paylaş…
              </button>
              <button onClick={kopyala} style={{ flex: "1", minHeight: "48px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
                {kopyalaMetin}
              </button>
            </div>
            <div style={{ fontSize: "var(--yazi-kucuk)", color: "var(--murekkep-3)" }}>
              odevdefteri.app/i/7KQ2MX · 24 saat geçerli, tek kullanımlık
            </div>
          </div>
        </div>
        <div role="status" style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px 30px 24px", borderTop: "1px solid var(--cizgi)", background: "var(--yuzey)" }}>
          <span style={{ flex: "none", width: "12px", height: "12px", borderRadius: "50%", boxShadow: "inset 0 0 0 2px var(--renk-bekliyor)" }} />
          <div style={{ flex: "1", minWidth: "0", fontSize: "var(--yazi-govde)", fontWeight: "600" }}>
            {cocukIn} izin vermesi bekleniyor
          </div>
          <button onClick={git.kurulum2} style={{ flex: "none", minHeight: "44px", padding: "0 16px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "transparent", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
            İptal
          </button>
        </div>
        </>
      ) : null}
      {e.izin ? (
        <>
        <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "12px 24px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--yazi-meta)", fontWeight: "600", color: "var(--murekkep-2)" }}>
            <span style={{ width: "8px", height: "8px", transform: "rotate(45deg)", borderRadius: "1px", background: "var(--renk-eksik)" }} />
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px var(--murekkep)" }} />
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
            <span style={{ marginLeft: "4px" }}>
              Ödev Defteri
            </span>
          </div>
          <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
            Merhaba {cocuk},
          </div>
          <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", textWrap: "pretty" }}>
            <strong>
              {ebeveynAdlari}
            </strong>
            ({haneAdi}) Classroom ödevlerini görmek için senden izin istiyor.
          </div>
          <div style={{ padding: "16px", borderRadius: "var(--kose-l)", background: "var(--yuzey)", border: "1px solid var(--cizgi)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "var(--yazi-meta)", fontWeight: "700", color: "var(--murekkep-2)" }}>
              Görebilecekleri
            </div>
            <div style={{ display: "flex", gap: "10px", fontSize: "var(--yazi-govde)", lineHeight: "1.4" }}>
              <span style={{ flex: "none", marginTop: "6px", width: "7px", height: "7px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
              Hangi ödevlerin olduğu ve son teslim günleri
            </div>
            <div style={{ display: "flex", gap: "10px", fontSize: "var(--yazi-govde)", lineHeight: "1.4" }}>
              <span style={{ flex: "none", marginTop: "6px", width: "7px", height: "7px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
              Ödevi teslim edip etmediğin
            </div>
            <div style={{ display: "flex", gap: "10px", fontSize: "var(--yazi-govde)", lineHeight: "1.4" }}>
              <span style={{ flex: "none", marginTop: "6px", width: "7px", height: "7px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
              Öğretmeninin verdiği notlar
            </div>
          </div>
          <div style={{ padding: "16px", borderRadius: "var(--kose-l)", border: "1px dashed var(--cizgi)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "var(--yazi-meta)", fontWeight: "700", color: "var(--murekkep-2)" }}>
              Göremeyecekleri, yapamayacakları
            </div>
            <div style={{ display: "flex", gap: "10px", fontSize: "var(--yazi-govde)", lineHeight: "1.4", color: "var(--murekkep-2)" }}>
              <span style={{ flex: "none", marginTop: "6px", width: "8px", height: "8px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px currentColor" }} />
              Teslim ettiğin dosyaların içi, mesajların, e-postaların
            </div>
            <div style={{ display: "flex", gap: "10px", fontSize: "var(--yazi-govde)", lineHeight: "1.4", color: "var(--murekkep-2)" }}>
              <span style={{ flex: "none", marginTop: "6px", width: "8px", height: "8px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px currentColor" }} />
              Senin yerine ödev teslim etmek ya da bir şey değiştirmek
            </div>
          </div>
          <div style={{ fontSize: "var(--yazi-meta)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
            İznini istediğin zaman Google hesabının ayarlarından kaldırabilirsin. Kaldırırsan panoda “bağlantı koptu” yazar; bu gizli değildir.
          </div>
        </div>
        <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: "8px", padding: "12px 24px 30px", borderTop: "1px solid var(--cizgi)", background: "var(--zemin)" }}>
          <button onClick={git.basari} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
            Google ile izin ver
          </button>
          <div style={{ fontSize: "var(--yazi-kucuk)", color: "var(--murekkep-3)", textAlign: "center" }}>
            Google okul hesabını seçmeni isteyecek.
          </div>
          <button onClick={git.hata} style={{ minHeight: "44px", border: "none", background: "transparent", color: "var(--murekkep-2)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
            Şimdi değil
          </button>
        </div>
        </>
      ) : null}
      {e.basari ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "8px 24px 36px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px" }}>
            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              {cocuk} bağlandı
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
              İlk ödev taraması birkaç dakika içinde tamamlanır. Sonrasında veriler 30 dakikada bir yenilenir.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={git.kurulum3} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              Devam
            </button>
            <button onClick={git.kurulum2} style={{ minHeight: "48px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
              Başka çocuk ekle
            </button>
          </div>
        </div>
        </>
      ) : null}
      {e.hata ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "8px 24px 36px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "14px" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", border: "2px dashed var(--murekkep-2)" }} />
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              Bağlantı kurulamadı
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
              {cocuk} izin ekranını kapattı ya da Classroom’un olmadığı bir hesapla giriş yaptı.
            </div>
            <div style={{ padding: "14px 16px", borderRadius: "var(--kose-m)", background: "var(--yuzey)", border: "1px solid var(--cizgi)", fontSize: "var(--yazi-meta)", lineHeight: "1.5", color: "var(--murekkep-2)" }}>
              Classroom ödevleri genelde okulun verdiği hesaptadır (ör. ad.soyad@okul.k12.tr). Kişisel Gmail hesabında ödev görünmez.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={git.bagla} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              Yeni izin bağlantısı oluştur
            </button>
            <button onClick={git.pano} style={{ minHeight: "48px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
              Sonra yaparım
            </button>
          </div>
        </div>
        </>
      ) : null}
      {e.kurulum3 ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "28px 24px 36px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              Diğer ebeveyni davet edin
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
              Aynı panoyu görür, aynı ayarlara erişir. Tüm ebeveynler eşittir.
            </div>
            <label style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "var(--yazi-meta)", fontWeight: "600", color: "var(--murekkep-2)" }}>
              E-posta adresi
              <input type="email" value={davet} onChange={davetDegis} style={{ minHeight: "52px", padding: "0 16px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "500 16px var(--yazi-aile)" }} />
            </label>
          </div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={git.pano} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              Davet gönder ve panoya geç
            </button>
            <button onClick={git.pano} style={{ minHeight: "48px", borderRadius: "var(--kose-m)", border: "none", background: "transparent", color: "var(--murekkep-2)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
              Şimdilik atla
            </button>
          </div>
        </div>
        </>
      ) : null}
      {ayarlarGoster ? (
        <>
        <div style={{ flex: "none", display: "flex", alignItems: "center", gap: "4px", padding: "0 16px 4px 6px" }}>
          <button onClick={git.pano} style={{ minHeight: "44px", padding: "0 12px", border: "none", background: "transparent", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
            ‹ Pano
          </button>
        </div>
        <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "4px 16px 32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "0 4px" }}>
            <span style={{ fontSize: "var(--yazi-kucuk)", fontWeight: "600", color: "var(--murekkep-3)" }}>
              Hane adı · dokunup değiştirin
            </span>
            <input value={haneAdi} onChange={haneAdiDegis} onBlur={haneAdiKaydet} aria-label="Hane adı" style={{ width: "100%", boxSizing: "border-box", margin: "0 -4px", padding: "2px 4px", border: "none", borderBottom: "1px dashed var(--cizgi)", borderRadius: "0", background: "transparent", color: "var(--murekkep)", font: "700 var(--yazi-vurgu) var(--yazi-aile)", letterSpacing: "-0.02em" }} style-focus="border-bottom:1px solid var(--murekkep);outline:none" />
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ padding: "0 4px", fontSize: "var(--yazi-meta)", fontWeight: "700", color: "var(--murekkep-2)" }}>
              Ebeveynler
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "var(--kose-l)", background: "var(--cizgi)", border: "1px solid var(--cizgi)", overflow: "hidden" }}>
              {(ebeveynler ?? []).map((p: any, _i3: number) => (
                <Fragment key={p?.key ?? _i3}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--yuzey)" }}>
                    <span style={{ flex: "none", width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--cizgi)", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: "600" }}>
                      {p.harf}
                    </span>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "600" }}>
                        {p.ad}
                        {p.benMiyim ? (
                          <>
                          <span style={{ fontWeight: "500", color: "var(--murekkep-3)" }}>
                            (siz)
                          </span>
                          </>
                        ) : null}
                      </div>
                      <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-3)", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.eposta}
                      </div>
                    </div>
                    {p.cikarGoster ? (
                      <>
                      <button onClick={p.cikar} aria-label={p.cikarAria} style={{ flex: "none", minHeight: "44px", padding: "0 14px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "transparent", color: "var(--murekkep-2)", font: "600 14px var(--yazi-aile)", cursor: "pointer" }}>
                        Çıkar
                      </button>
                      </>
                    ) : null}
                  </div>
                </Fragment>
              ))}
              <button onClick={git.kurulum3} style={{ minHeight: "52px", padding: "0 16px", border: "none", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", textAlign: "left", cursor: "pointer" }}>
                + Ebeveyn davet et
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ padding: "0 4px", fontSize: "var(--yazi-meta)", fontWeight: "700", color: "var(--murekkep-2)" }}>
              Çocuklar
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "var(--kose-l)", background: "var(--cizgi)", border: "1px solid var(--cizgi)", overflow: "hidden" }}>
              {(cocuklar ?? []).map((c: any, _i4: number) => (
                <Fragment key={c?.key ?? _i4}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px 16px", background: "var(--yuzey)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ position: "relative", flex: "none", width: "36px", height: "36px", borderRadius: "50%", background: `${c.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "13px", fontWeight: "700" }}>
                        {c.harf}
                        {c.koptu ? (
                          <>
                          <span style={{ position: "absolute", bottom: "-4px", right: "-6px", width: "14px", height: "14px", boxSizing: "border-box", borderRadius: "50%", background: "var(--yuzey)", border: "2px dashed var(--murekkep-2)" }} />
                          </>
                        ) : null}
                      </span>
                      <div style={{ flex: "1", minWidth: "0" }}>
                        <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "600" }}>
                          {c.ad} · {c.sinif}
                        </div>
                        {c.bagli ? (
                          <>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--yazi-meta)", color: "var(--renk-tamam-metin)" }}>
                            <span style={{ flex: "none", width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
                            <span style={{ minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.durumMetin}
                            </span>
                          </div>
                          </>
                        ) : null}
                        {c.bekliyor ? (
                          <>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)" }}>
                            <span style={{ flex: "none", width: "8px", height: "8px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px currentColor" }} />
                            <span style={{ minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.durumMetin}
                            </span>
                          </div>
                          </>
                        ) : null}
                        {c.koptu ? (
                          <>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)" }}>
                            <span style={{ flex: "none", width: "8px", height: "8px", boxSizing: "border-box", borderRadius: "50%", border: "1.5px dashed currentColor" }} />
                            <span style={{ minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {c.durumMetin}
                            </span>
                          </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginLeft: "48px", flexWrap: "wrap" }}>
                      {c.koptu ? (
                        <>
                        <button onClick={c.yenidenBagla} style={{ minHeight: "44px", padding: "0 14px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 14px var(--yazi-aile)", cursor: "pointer" }}>
                          Yeniden izin iste
                        </button>
                        </>
                      ) : null}
                      <button onClick={c.kaldir} aria-label={c.kaldirAria} style={{ minHeight: "44px", padding: "0 14px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "transparent", color: "var(--murekkep-2)", font: "600 14px var(--yazi-aile)", cursor: "pointer" }}>
                        Bağlantıyı kaldır
                      </button>
                    </div>
                  </div>
                </Fragment>
              ))}
              <button onClick={git.kurulum2} style={{ minHeight: "52px", padding: "0 16px", border: "none", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", textAlign: "left", cursor: "pointer" }}>
                + Çocuk ekle
              </button>
            </div>
          </div>
          <button onClick={git.giris} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "transparent", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
            Çıkış yap
          </button>
        </div>
        </>
      ) : null}
      {e.kaldir ? (
        <>
        <div onClick={git.ayarlar} style={{ position: "absolute", inset: "0", zIndex: "20", background: "var(--perde)" }} />
        <div role="alertdialog" aria-label="Bağlantıyı kaldır" style={{ position: "absolute", left: "0", right: "0", bottom: "0", zIndex: "21", display: "flex", flexDirection: "column", gap: "14px", padding: "22px 20px 30px", background: "var(--zemin)", borderRadius: "24px 24px 0 0", boxShadow: "var(--golge-panel)" }}>
          <div style={{ fontSize: "var(--yazi-baslik)", fontWeight: "700", letterSpacing: "-0.015em", lineHeight: "1.25" }}>
            {cocukIn} bağlantısı kaldırılsın mı?
          </div>
          <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
            {cocuk} adına kayıtlı tüm ödev geçmişi bu panodan silinir ve geri getirilemez. Hanedeki tüm ebeveynler için kaybolur.
          </div>
          <div style={{ fontSize: "var(--yazi-meta)", lineHeight: "1.5", color: "var(--murekkep-3)" }}>
            {cocukIn} Google hesabı ve Classroom’daki ödevleri etkilenmez. Tekrar bağlamak için yeni izin gerekir.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
            <button onClick={git.ayarlar} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              Vazgeç
            </button>
            <button onClick={git.ayarlar} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "1.5px solid var(--renk-eksik-metin)", background: "transparent", color: "var(--renk-eksik-metin)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              Bağlantıyı ve geçmişi sil
            </button>
          </div>
        </div>
        </>
      ) : null}
    </div>
    </>
  );
}
