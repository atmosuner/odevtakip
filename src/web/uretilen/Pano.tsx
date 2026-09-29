// ÜRETİLEN DOSYA — elle düzenleme. Kaynak: design/Pano.dc.html
// Yeniden üret: npm run port
//
// Inline stiller tasarımdan birebir taşındı. Görsel fark olmaması için
// bu dosyadaki stil değerlerini değiştirme; değişiklik gerekiyorsa
// tasarım dosyasını güncelleyip dönüştürücüyü tekrar çalıştır.
/* eslint-disable */
import { Fragment } from 'react';
import type { PanoProps } from '../tipler';

export function Pano(p: PanoProps) {
  const {
    altBosluk,
    ayGeri,
    ayIleri,
    ayarlar,
    bandAlt,
    bandAltGoster,
    bandAria,
    bandBaslik,
    bandCipler,
    bandCizgi,
    bandCocuklar,
    bandCokluA,
    bandCokluB,
    bandOk,
    bandTek,
    bandZemin,
    cocukEkle,
    cocukYok,
    dock,
    dockA,
    dockB,
    eksikBos,
    eksikSatirlar,
    eksikVar,
    filtreGoster,
    filtreler,
    haneAdi,
    icerik,
    iskelet,
    kolonlar,
    masa,
    secAd,
    secAlt,
    secAria,
    secHarf,
    secRenk,
    sheetAc,
    sheetAcik,
    sheetKapat,
    sonrakiCocuk,
    tBas,
    tSon,
    tazele,
    tazelikMetin,
    tazelikNormal,
    tazelikUyari,
    telefon,
    yenidenBagla,
    yukleniyor,
  } = p;

  return (
    <>
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--zemin)", color: "var(--murekkep)", fontFamily: "var(--yazi-aile)", containerType: "inline-size", WebkitFontSmoothing: "antialiased" }}>
      {telefon ? (
        <>
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
        </>
      ) : null}
      <header style={{ flex: "none", display: "flex", alignItems: "center", gap: "12px", padding: "6px clamp(16px,3cqi,32px) 12px" }}>
        <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
          <div style={{ fontSize: "var(--yazi-baslik-s)", fontWeight: "700", letterSpacing: "-0.01em" }}>
            {haneAdi}
          </div>
          {tazelikNormal ? (
            <>
            <button onClick={tazele} aria-label="Verileri yenile" style={{ alignSelf: "flex-start", margin: "0", padding: "0", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: "var(--yazi-meta)", color: "var(--murekkep-3)" }}>
              {tazelikMetin}
            </button>
            </>
          ) : null}
          {tazelikUyari ? (
            <>
            <button onClick={tazele} aria-label="Verileri yenile" style={{ margin: "0", background: "none", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 10px 3px 8px", borderRadius: "var(--kose-tam)", border: "1px solid var(--renk-eksik)", color: "var(--renk-eksik-metin)", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px var(--renk-eksik-metin)" }} />
              {tazelikMetin}
            </button>
            </>
          ) : null}
        </div>
        <button onClick={ayarlar} aria-label="Hane ayarları" style={{ flex: "none", width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
          B
        </button>
      </header>
      {yukleniyor ? (
        <>
        <div aria-busy="true" aria-label="Yükleniyor" style={{ flex: "1", minHeight: "0", overflow: "hidden", padding: "0 16px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ height: "84px", borderRadius: "var(--kose-l)", background: "var(--yuzey-2)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ width: "120px", height: "18px", borderRadius: "6px", background: "var(--yuzey-2)" }} />
            <div style={{ width: "92px", height: "32px", borderRadius: "16px", background: "var(--yuzey-2)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: "16px 0", justifyItems: "center" }}>
            {(iskelet ?? []).map((x: any, _i0: number) => (
              <Fragment key={x?.key ?? _i0}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--yuzey-2)" }} />
              </Fragment>
            ))}
          </div>
          <div style={{ width: "140px", height: "12px", borderRadius: "6px", background: "var(--yuzey-2)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", borderRadius: "var(--kose-l)", overflow: "hidden" }}>
            <div style={{ height: "80px", background: "var(--yuzey-2)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", padding: "0 16px" }}>
              <div style={{ width: "35%", height: "10px", borderRadius: "5px", background: "var(--cizgi)" }} />
              <div style={{ width: "80%", height: "12px", borderRadius: "6px", background: "var(--cizgi)" }} />
            </div>
            <div style={{ height: "80px", background: "var(--yuzey-2)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", padding: "0 16px" }}>
              <div style={{ width: "45%", height: "10px", borderRadius: "5px", background: "var(--cizgi)" }} />
              <div style={{ width: "70%", height: "12px", borderRadius: "6px", background: "var(--cizgi)" }} />
            </div>
          </div>
        </div>
        </>
      ) : null}
      {cocukYok ? (
        <>
        <div style={{ flex: "1", display: "flex", flexDirection: "column", padding: "0 24px 40px" }}>
          <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ width: "12px", height: "12px", transform: "rotate(45deg)", borderRadius: "2px", background: "var(--cizgi)" }} />
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", boxShadow: "inset 0 0 0 2px var(--cizgi)" }} />
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--cizgi)" }} />
            </div>
            <div style={{ fontSize: "var(--yazi-vurgu)", fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              Henüz bağlı çocuk yok
            </div>
            <div style={{ fontSize: "var(--yazi-govde)", lineHeight: "1.5", color: "var(--murekkep-2)", textWrap: "pretty" }}>
              Ödevleri görmek için bir çocuğu bağlayın. Çocuğunuz kendi Google hesabıyla izin verir; yanınızdaysa telefonuyla bir QR kodu okutması yeter.
            </div>
          </div>
          <button onClick={cocukEkle} style={{ minHeight: "52px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
            Çocuk ekle
          </button>
        </div>
        </>
      ) : null}
      {icerik ? (
        <>
        <div style={{ flex: "1", minHeight: "0", overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px 32px", alignItems: "flex-start", padding: "0 clamp(16px,3cqi,32px)" }}>
            <div style={{ flex: "1 1 520px", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px" }}>
              {bandTek ? (
                <>
                <button onClick={sheetAc} aria-label={bandAria} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", minHeight: "76px", borderRadius: "var(--kose-l)", border: `1px solid ${bandCizgi}`, background: `${bandZemin}`, color: "var(--murekkep)", fontFamily: "inherit", cursor: "pointer" }}>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ fontSize: "var(--yazi-baslik)", fontWeight: "700", letterSpacing: "-0.015em", lineHeight: "1.25" }}>
                      {bandBaslik}
                    </div>
                    <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)", marginTop: "4px", textWrap: "pretty" }}>
                      {bandAlt}
                    </div>
                  </div>
                  {bandOk ? (
                    <>
                    <span style={{ flex: "none", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                      Listeyi aç ›
                    </span>
                    </>
                  ) : null}
                </button>
                </>
              ) : null}
              {bandCokluA ? (
                <>
                <button onClick={sheetAc} aria-label={bandAria} style={{ width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "12px", padding: "14px", borderRadius: "var(--kose-l)", border: `1px solid ${bandCizgi}`, background: `${bandZemin}`, color: "var(--murekkep)", fontFamily: "inherit", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px", width: "100%", padding: "0 4px", boxSizing: "border-box" }}>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <div style={{ fontSize: "var(--yazi-baslik)", fontWeight: "700", letterSpacing: "-0.015em", lineHeight: "1.25" }}>
                        {bandBaslik}
                      </div>
                      {bandAltGoster ? (
                        <>
                        <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)", marginTop: "4px" }}>
                          {bandAlt}
                        </div>
                        </>
                      ) : null}
                    </div>
                    {bandOk ? (
                      <>
                      <span style={{ flex: "none", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                        Listeyi aç ›
                      </span>
                      </>
                    ) : null}
                  </div>
                  {bandCipler ? (
                    <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "6px", width: "100%" }}>
                      {(bandCocuklar ?? []).map((b: any, _i1: number) => (
                        <Fragment key={b?.key ?? _i1}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "0", padding: "8px 10px", borderRadius: "var(--kose-m)", background: "var(--yuzey)" }}>
                            <span style={{ flex: "none", width: "28px", height: "28px", borderRadius: "50%", background: `${b.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "700" }}>
                              {b.harf}
                            </span>
                            <div style={{ minWidth: "0", display: "flex", flexDirection: "column" }}>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--yazi-govde)", fontWeight: "600" }}>
                                {b.ad}
                              </span>
                              <span style={{ fontSize: "var(--yazi-meta)", fontWeight: "600", color: `${b.metinRenk}` }}>
                                {b.metin}
                              </span>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    </>
                  ) : null}
                </button>
                </>
              ) : null}
              {bandCokluB ? (
                <>
                <button onClick={sheetAc} aria-label={bandAria} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", minHeight: "76px", borderRadius: "var(--kose-l)", border: `1px solid ${bandCizgi}`, background: `${bandZemin}`, color: "var(--murekkep)", fontFamily: "inherit", cursor: "pointer" }}>
                  <div style={{ flex: "1", minWidth: "0" }}>
                    <div style={{ fontSize: "var(--yazi-baslik)", fontWeight: "700", letterSpacing: "-0.015em", lineHeight: "1.25" }}>
                      {bandBaslik}
                    </div>
                    <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)", marginTop: "4px", textWrap: "pretty" }}>
                      {bandAlt}
                    </div>
                  </div>
                  <div style={{ flex: "none", display: "flex", gap: "8px", paddingTop: "4px" }}>
                    {(bandCocuklar ?? []).map((b: any, _i2: number) => (
                      <Fragment key={b?.key ?? _i2}>
                        <span style={{ position: "relative", width: "34px", height: "34px", borderRadius: "50%", background: `${b.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "12px", fontWeight: "700" }}>
                          {b.harf}
                          {b.eksikVar ? (
                            <>
                            <span style={{ position: "absolute", top: "-6px", right: "-6px", minWidth: "18px", height: "18px", padding: "0 5px", boxSizing: "border-box", borderRadius: "9px", background: "var(--renk-eksik-metin)", color: "var(--ters)", fontSize: "11px", fontWeight: "700", display: "grid", placeItems: "center", boxShadow: "0 0 0 2px var(--renk-eksik-zemin)" }}>
                              {b.sayi}
                            </span>
                            </>
                          ) : null}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                </button>
                </>
              ) : null}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "40px 32px" }}>
                {(kolonlar ?? []).map((k: any, _i3: number) => (
                  <Fragment key={k?.key ?? _i3}>
                    <section style={{ minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
                      {k.baslikGoster ? (
                        <>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ flex: "none", width: "28px", height: "28px", borderRadius: "50%", background: `${k.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "700" }}>
                            {k.harf}
                          </span>
                          <span style={{ fontSize: "var(--yazi-baslik-s)", fontWeight: "700" }}>
                            {k.ad}
                          </span>
                          <span style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-3)" }}>
                            {k.sinif}
                          </span>
                        </div>
                        </>
                      ) : null}
                      {k.kopuk ? (
                        <>
                        <div role="status" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "var(--kose-l)", background: "var(--yuzey-2)", border: "1px solid var(--murekkep-3)" }}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <span style={{ flex: "none", marginTop: "2px", width: "18px", height: "18px", borderRadius: "50%", border: "2px dashed var(--murekkep-2)", boxSizing: "border-box" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "700" }}>
                                {k.adIn} verisi güncellenmiyor
                              </div>
                              <div style={{ fontSize: "var(--yazi-meta)", lineHeight: "1.45", color: "var(--murekkep-2)", textWrap: "pretty" }}>
                                Google bağlantısı 27 Eylül 14:20’de koptu. Aşağıdakiler o saatteki son bilinen durum; sonrasında verilen ya da teslim edilen ödevler görünmüyor. Düzeltmek için {k.adIn} tekrar izin vermesi gerekiyor.
                              </div>
                            </div>
                          </div>
                          <button onClick={yenidenBagla} style={{ minHeight: "44px", borderRadius: "var(--kose-m)", border: "none", background: "var(--murekkep)", color: "var(--ters)", font: "600 15px var(--yazi-aile)", cursor: "pointer" }}>
                            Yeniden izin iste
                          </button>
                        </div>
                        </>
                      ) : null}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px 32px", alignItems: "flex-start" }}>
                        <div style={{ flex: "1 1 300px", maxWidth: "520px", minWidth: "0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "2px", margin: "0 -8px 6px 2px" }}>
                            <div style={{ flex: "1", minWidth: "0", display: "flex", alignItems: "baseline", gap: "8px" }}>
                              <span style={{ fontSize: "var(--yazi-baslik-s)", fontWeight: "700" }}>
                                {k.ayBaslik}
                              </span>
                              {k.kopuk ? (
                                <>
                                <span style={{ fontSize: "var(--yazi-kucuk)", fontWeight: "600", color: "var(--murekkep-2)", padding: "2px 6px", borderRadius: "6px", border: "1px dashed var(--murekkep-3)" }}>
                                  27 Eylül verisi
                                </span>
                                </>
                              ) : null}
                            </div>
                            <button onClick={ayGeri} aria-label="Önceki ay" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "none", background: "transparent", color: "var(--murekkep)", font: "400 24px var(--yazi-aile)", cursor: "pointer" }}>
                              ‹
                            </button>
                            <button onClick={ayIleri} aria-label="Sonraki ay" style={{ width: "44px", height: "44px", borderRadius: "50%", border: "none", background: "transparent", color: "var(--murekkep)", font: "400 24px var(--yazi-aile)", cursor: "pointer" }}>
                              ›
                            </button>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", textAlign: "center", fontSize: "var(--yazi-kucuk)", fontWeight: "600", color: "var(--murekkep-3)", paddingBottom: "4px" }}>
                            <span>
                              Pzt
                            </span>
                            <span>
                              Sal
                            </span>
                            <span>
                              Çar
                            </span>
                            <span>
                              Per
                            </span>
                            <span>
                              Cum
                            </span>
                            <span>
                              Cmt
                            </span>
                            <span>
                              Paz
                            </span>
                          </div>
                          <div onTouchStart={tBas} onTouchEnd={tSon} style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", rowGap: "2px" }}>
                            {(k.hucreler ?? []).map((h: any, _i4: number) => (
                              <Fragment key={h?.key ?? _i4}>
                                {h.bos ? (
                                  <>
                                  <div />
                                  </>
                                ) : null}
                                {h.dolu ? (
                                  <>
                                  <button onClick={h.sec} aria-label={h.aria} aria-pressed={h.secili} style={h.stil}>
                                    <span style={h.sayiStil}>
                                      {h.gun}
                                    </span>
                                    <span style={{ height: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {h.eksik ? (
                                        <>
                                        <span style={{ width: "7px", height: "7px", transform: "rotate(45deg)", borderRadius: "1px", background: "var(--renk-eksik)" }} />
                                        </>
                                      ) : null}
                                      {h.bekliyor ? (
                                        <>
                                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px var(--renk-bekliyor)" }} />
                                        </>
                                      ) : null}
                                      {h.tamam ? (
                                        <>
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
                                        </>
                                      ) : null}
                                    </span>
                                  </button>
                                  </>
                                ) : null}
                              </Fragment>
                            ))}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: "10px", padding: "0 2px", fontSize: "var(--yazi-kucuk)", color: "var(--murekkep-2)" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "7px", height: "7px", transform: "rotate(45deg)", borderRadius: "1px", background: "var(--renk-eksik)" }} />
                              Eksik
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px var(--renk-bekliyor)" }} />
                              Bekliyor
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--renk-tamam)" }} />
                              Teslim edildi / notlandı
                            </span>
                          </div>
                          {k.takipVar ? (
                            <>
                            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "10px", padding: "0 2px", fontSize: "var(--yazi-kucuk)", lineHeight: "1.45", color: "var(--murekkep-2)" }}>
                              <span style={{ flex: "none", width: "14px", height: "14px", borderRadius: "4px", background: "var(--tarama)", border: "1px solid var(--cizgi)", marginTop: "1px" }} />
                              <span style={{ textWrap: "pretty" }}>
                                {k.takipNotu}
                              </span>
                            </div>
                            </>
                          ) : null}
                        </div>
                        <div style={{ flex: "1 1 280px", minWidth: "0", display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ fontSize: "var(--yazi-meta)", fontWeight: "600", color: "var(--murekkep-2)", padding: "0 2px" }}>
                            {k.gunBaslik}
                          </div>
                          {k.ilkTarama ? (
                            <>
                            <div style={{ padding: "16px", borderRadius: "var(--kose-l)", background: "var(--yuzey)", border: "1px solid var(--cizgi)", display: "flex", flexDirection: "column", gap: "6px" }}>
                              <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "700" }}>
                                İlk tarama sürüyor
                              </div>
                              <div style={{ fontSize: "var(--yazi-meta)", lineHeight: "1.45", color: "var(--murekkep-2)", textWrap: "pretty" }}>
                                {k.adIn} Classroom ödevleri ilk kez okunuyor. Bu genelde birkaç dakika sürer; pano kendiliğinden güncellenir.
                              </div>
                            </div>
                            </>
                          ) : null}
                          {k.gunBos ? (
                            <>
                            <div style={{ padding: "14px 16px", borderRadius: "var(--kose-m)", border: "1px dashed var(--cizgi)", fontSize: "var(--yazi-govde)", color: "var(--murekkep-2)" }}>
                              Bu gün ödev yok
                            </div>
                            </>
                          ) : null}
                          {k.gunVar ? (
                            <>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "var(--kose-l)", background: "var(--cizgi)", border: "1px solid var(--cizgi)", overflow: "hidden" }}>
                              {(k.gunOdev ?? []).map((o: any, _i5: number) => (
                                <Fragment key={o?.key ?? _i5}>
                                  <a href={o.href} target="_blank" rel="noopener" aria-label={o.aria} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", minHeight: "64px", background: "var(--yuzey)", textDecoration: "none", color: "var(--murekkep)" }}>
                                    <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
                                      <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {o.ust}
                                      </div>
                                      <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "600", lineHeight: "1.35", textWrap: "pretty" }}>
                                        {o.baslik}
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                                        {o.eksik ? (
                                          <>
                                          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "3px 9px 3px 8px", borderRadius: "var(--kose-s)", background: "var(--renk-eksik-zemin)", color: "var(--renk-eksik-metin)", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                                            <span style={{ width: "7px", height: "7px", transform: "rotate(45deg)", borderRadius: "1px", background: "currentColor" }} />
                                            {o.etiket}
                                          </span>
                                          </>
                                        ) : null}
                                        {o.bekliyor ? (
                                          <>
                                          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "3px 9px 3px 8px", borderRadius: "var(--kose-s)", background: "var(--yuzey-2)", color: "var(--murekkep-2)", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px currentColor" }} />
                                            {o.etiket}
                                          </span>
                                          </>
                                        ) : null}
                                        {o.tamam ? (
                                          <>
                                          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "3px 9px 3px 8px", borderRadius: "var(--kose-s)", background: "var(--renk-tamam-zemin)", color: "var(--renk-tamam-metin)", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
                                            {o.etiket}
                                          </span>
                                          </>
                                        ) : null}
                                        {o.puanVar ? (
                                          <>
                                          <span style={{ fontSize: "var(--yazi-govde)", fontWeight: "700", fontVariantNumeric: "tabular-nums" }}>
                                            {o.puan}
                                          </span>
                                          </>
                                        ) : null}
                                      </div>
                                    </div>
                                    <span aria-hidden="true" style={{ flex: "none", fontSize: "15px", color: "var(--murekkep-3)", marginTop: "1px" }}>
                                      ↗
                                    </span>
                                  </a>
                                </Fragment>
                              ))}
                            </div>
                            </>
                          ) : null}
                          {k.tarihsizVar ? (
                            <>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "14px", padding: "0 2px" }}>
                              <div style={{ fontSize: "var(--yazi-meta)", fontWeight: "600", color: "var(--murekkep-2)" }}>
                                Teslim tarihi olmayan
                              </div>
                              <div style={{ fontSize: "var(--yazi-kucuk)", color: "var(--murekkep-3)" }}>
                                Takvimde görünmez, eksik sayılmaz.
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "var(--kose-l)", background: "var(--cizgi)", border: "1px solid var(--cizgi)", overflow: "hidden" }}>
                              {(k.tarihsiz ?? []).map((o: any, _i6: number) => (
                                <Fragment key={o?.key ?? _i6}>
                                  <a href={o.href} target="_blank" rel="noopener" aria-label={o.aria} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", minHeight: "64px", background: "var(--yuzey)", textDecoration: "none", color: "var(--murekkep)" }}>
                                    <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
                                      <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                        {o.ust}
                                      </div>
                                      <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "600", lineHeight: "1.35", textWrap: "pretty" }}>
                                        {o.baslik}
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                                        {o.bekliyor ? (
                                          <>
                                          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "3px 9px 3px 8px", borderRadius: "var(--kose-s)", background: "var(--yuzey-2)", color: "var(--murekkep-2)", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", boxShadow: "inset 0 0 0 1.5px currentColor" }} />
                                            {o.etiket}
                                          </span>
                                          </>
                                        ) : null}
                                        {o.tamam ? (
                                          <>
                                          <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "3px 9px 3px 8px", borderRadius: "var(--kose-s)", background: "var(--renk-tamam-zemin)", color: "var(--renk-tamam-metin)", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }} />
                                            {o.etiket}
                                          </span>
                                          </>
                                        ) : null}
                                        {o.puanVar ? (
                                          <>
                                          <span style={{ fontSize: "var(--yazi-govde)", fontWeight: "700", fontVariantNumeric: "tabular-nums" }}>
                                            {o.puan}
                                          </span>
                                          </>
                                        ) : null}
                                      </div>
                                    </div>
                                    <span aria-hidden="true" style={{ flex: "none", fontSize: "15px", color: "var(--murekkep-3)", marginTop: "1px" }}>
                                      ↗
                                    </span>
                                  </a>
                                </Fragment>
                              ))}
                            </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </section>
                  </Fragment>
                ))}
              </div>
            </div>
            {masa ? (
              <>
              <aside style={{ flex: "0 1 380px", minWidth: "300px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "var(--yazi-baslik-s)", fontWeight: "700" }}>
                    Eksik ödevler
                  </div>
                  <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-3)", marginTop: "2px" }}>
                    En eski gecikme en üstte
                  </div>
                </div>
                {filtreGoster ? (
                  <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {(filtreler ?? []).map((f: any, _i7: number) => (
                      <Fragment key={f?.key ?? _i7}>
                        <button onClick={f.sec} aria-pressed={f.secili} style={f.stil}>
                          {f.renkVar ? (
                            <>
                            <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: `${f.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "9px", fontWeight: "700" }}>
                              {f.harf}
                            </span>
                            </>
                          ) : null}
                          {f.ad}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  </>
                ) : null}
                {eksikBos ? (
                  <>
                  <div style={{ padding: "14px 16px", borderRadius: "var(--kose-m)", border: "1px dashed var(--cizgi)", fontSize: "var(--yazi-govde)", color: "var(--murekkep-2)" }}>
                    Eksik ödev yok
                  </div>
                  </>
                ) : null}
                {eksikVar ? (
                  <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "var(--kose-l)", background: "var(--cizgi)", border: "1px solid var(--cizgi)", overflow: "hidden" }}>
                    {(eksikSatirlar ?? []).map((o: any, _i8: number) => (
                      <Fragment key={o?.key ?? _i8}>
                        <a href={o.href} target="_blank" rel="noopener" aria-label={o.aria} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", background: "var(--yuzey)", textDecoration: "none", color: "var(--murekkep)" }}>
                          {o.coklu ? (
                            <>
                            <span style={{ flex: "none", marginTop: "1px", width: "28px", height: "28px", borderRadius: "50%", background: `${o.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "700" }}>
                              {o.harf}
                            </span>
                            </>
                          ) : null}
                          <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
                            <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)" }}>
                              {o.ust}
                            </div>
                            <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "600", lineHeight: "1.35", textWrap: "pretty" }}>
                              {o.baslik}
                            </div>
                            <span style={{ alignSelf: "flex-start", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "7px", padding: "3px 9px 3px 8px", borderRadius: "var(--kose-s)", background: "var(--renk-eksik-zemin)", color: "var(--renk-eksik-metin)", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                              <span style={{ width: "7px", height: "7px", transform: "rotate(45deg)", borderRadius: "1px", background: "currentColor" }} />
                              {o.etiket}
                            </span>
                          </div>
                          <span aria-hidden="true" style={{ flex: "none", fontSize: "15px", color: "var(--murekkep-3)" }}>
                            ↗
                          </span>
                        </a>
                      </Fragment>
                    ))}
                  </div>
                  </>
                ) : null}
              </aside>
              </>
            ) : null}
            <div style={{ flex: "none", width: "100%", height: `${altBosluk}` }} />
          </div>
        </div>
        </>
      ) : null}
      {dockA ? (
        <>
        <nav aria-label="Çocuk seçimi" style={{ position: "absolute", left: "0", right: "0", bottom: "0", zIndex: "10", padding: "8px 12px 26px", background: "var(--yuzey)", borderTop: "1px solid var(--cizgi)" }}>
          <div role="tablist" style={{ display: "flex", gap: "4px", padding: "4px", borderRadius: "18px", background: "var(--yuzey-2)" }}>
            {(dock ?? []).map((d: any, _i9: number) => (
              <Fragment key={d?.key ?? _i9}>
                <button role="tab" aria-selected={d.secili} aria-label={d.aria} onClick={d.sec} style={d.stil}>
                  <span style={{ position: "relative", flex: "none", width: "28px", height: "28px", borderRadius: "50%", background: `${d.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "700" }}>
                    {d.harf}
                    {d.rozet ? (
                      <>
                      <span style={{ position: "absolute", top: "-6px", right: "-9px", minWidth: "18px", height: "18px", padding: "0 5px", boxSizing: "border-box", borderRadius: "9px", background: "var(--renk-eksik-metin)", color: "var(--ters)", fontSize: "11px", fontWeight: "700", display: "grid", placeItems: "center", boxShadow: "0 0 0 2px var(--yuzey-2)" }}>
                        {d.sayi}
                      </span>
                      </>
                    ) : null}
                    {d.kopuk ? (
                      <>
                      <span style={{ position: "absolute", bottom: "-4px", right: "-6px", width: "14px", height: "14px", boxSizing: "border-box", borderRadius: "50%", background: "var(--yuzey)", border: "2px dashed var(--murekkep-2)" }} />
                      </>
                    ) : null}
                  </span>
                  <span style={{ minWidth: "0", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.ad}
                  </span>
                </button>
              </Fragment>
            ))}
          </div>
        </nav>
        </>
      ) : null}
      {dockB ? (
        <>
        <nav aria-label="Çocuk seçimi" style={{ position: "absolute", left: "0", right: "0", bottom: "0", zIndex: "10", padding: "8px 12px 26px", background: "var(--yuzey)", borderTop: "1px solid var(--cizgi)" }}>
          <button onClick={sonrakiCocuk} aria-label={secAria} style={{ width: "100%", minHeight: "60px", display: "flex", alignItems: "center", gap: "12px", padding: "8px 16px 8px 10px", borderRadius: "18px", border: "none", background: "var(--yuzey-2)", color: "var(--murekkep)", fontFamily: "inherit", textAlign: "left", cursor: "pointer" }}>
            <span style={{ position: "relative", flex: "none", width: "40px", height: "40px", borderRadius: "50%", background: `${secRenk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "13px", fontWeight: "700" }}>
              {secHarf}
            </span>
            <div style={{ flex: "1", minWidth: "0" }}>
              <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {secAd}
              </div>
              <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)" }}>
                {secAlt}
              </div>
            </div>
            <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <span style={{ fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                Sıradaki ›
              </span>
              <div style={{ display: "flex", gap: "5px" }}>
                {(dock ?? []).map((d: any, _i10: number) => (
                  <Fragment key={d?.key ?? _i10}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: `${d.nokta}` }} />
                  </Fragment>
                ))}
              </div>
            </div>
          </button>
        </nav>
        </>
      ) : null}
      {sheetAcik ? (
        <>
        <div onClick={sheetKapat} style={{ position: "absolute", inset: "0", zIndex: "20", background: "var(--perde)" }} />
        <div role="dialog" aria-label="Eksik ödevler" style={{ position: "absolute", left: "0", right: "0", bottom: "0", zIndex: "21", maxHeight: "88%", display: "flex", flexDirection: "column", background: "var(--zemin)", borderRadius: "24px 24px 0 0", boxShadow: "var(--golge-panel)" }}>
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
            <span style={{ width: "40px", height: "5px", borderRadius: "3px", background: "var(--cizgi)" }} />
          </div>
          <div style={{ padding: "10px 20px 12px" }}>
            <div style={{ fontSize: "var(--yazi-baslik)", fontWeight: "700", letterSpacing: "-0.015em" }}>
              Eksik ödevler
            </div>
            <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-3)", marginTop: "2px" }}>
              En eski gecikme en üstte · Satıra dokunun, Classroom’da açılır
            </div>
          </div>
          {filtreGoster ? (
            <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "0 16px 12px" }}>
              {(filtreler ?? []).map((f: any, _i11: number) => (
                <Fragment key={f?.key ?? _i11}>
                  <button onClick={f.sec} aria-pressed={f.secili} style={f.stil}>
                    {f.renkVar ? (
                      <>
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: `${f.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "9px", fontWeight: "700" }}>
                        {f.harf}
                      </span>
                      </>
                    ) : null}
                    {f.ad}
                  </button>
                </Fragment>
              ))}
            </div>
            </>
          ) : null}
          <div style={{ flex: "1", minHeight: "0", overflowY: "auto", padding: "0 16px" }}>
            {eksikBos ? (
              <>
              <div style={{ padding: "14px 16px", borderRadius: "var(--kose-m)", border: "1px dashed var(--cizgi)", fontSize: "var(--yazi-govde)", color: "var(--murekkep-2)" }}>
                Eksik ödev yok
              </div>
              </>
            ) : null}
            {eksikVar ? (
              <>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", borderRadius: "var(--kose-l)", background: "var(--cizgi)", border: "1px solid var(--cizgi)", overflow: "hidden" }}>
                {(eksikSatirlar ?? []).map((o: any, _i12: number) => (
                  <Fragment key={o?.key ?? _i12}>
                    <a href={o.href} target="_blank" rel="noopener" aria-label={o.aria} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 16px", minHeight: "64px", background: "var(--yuzey)", textDecoration: "none", color: "var(--murekkep)" }}>
                      {o.coklu ? (
                        <>
                        <span style={{ flex: "none", marginTop: "1px", width: "28px", height: "28px", borderRadius: "50%", background: `${o.renk}`, color: "var(--cocuk-uzeri)", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: "700" }}>
                          {o.harf}
                        </span>
                        </>
                      ) : null}
                      <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
                        <div style={{ fontSize: "var(--yazi-meta)", color: "var(--murekkep-2)" }}>
                          {o.ust}
                        </div>
                        <div style={{ fontSize: "var(--yazi-govde)", fontWeight: "600", lineHeight: "1.35", textWrap: "pretty" }}>
                          {o.baslik}
                        </div>
                        <span style={{ alignSelf: "flex-start", marginTop: "4px", display: "inline-flex", alignItems: "center", gap: "7px", padding: "3px 9px 3px 8px", borderRadius: "var(--kose-s)", background: "var(--renk-eksik-zemin)", color: "var(--renk-eksik-metin)", fontSize: "var(--yazi-meta)", fontWeight: "600" }}>
                          <span style={{ width: "7px", height: "7px", transform: "rotate(45deg)", borderRadius: "1px", background: "currentColor" }} />
                          {o.etiket}
                        </span>
                      </div>
                      <span aria-hidden="true" style={{ flex: "none", fontSize: "15px", color: "var(--murekkep-3)" }}>
                        ↗
                      </span>
                    </a>
                  </Fragment>
                ))}
              </div>
              </>
            ) : null}
          </div>
          <div style={{ padding: "12px 16px 30px" }}>
            <button onClick={sheetKapat} style={{ width: "100%", minHeight: "50px", borderRadius: "var(--kose-m)", border: "1px solid var(--cizgi)", background: "var(--yuzey)", color: "var(--murekkep)", font: "600 16px var(--yazi-aile)", cursor: "pointer" }}>
              Kapat
            </button>
          </div>
        </div>
        </>
      ) : null}
    </div>
    </>
  );
}
