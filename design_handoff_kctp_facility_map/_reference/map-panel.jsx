// Side panel + hover tooltip — refined typography, brand-aligned

function HoverTooltip({ hangarId, mousePos, theme }) {
  if (!hangarId || !window.HANGAR_DATA[hangarId]) return null;
  const d = window.HANGAR_DATA[hangarId];
  return (
    <div style={{
      position: "fixed",
      left: mousePos.vx + 16,
      top: mousePos.vy + 16,
      background: theme.panelBg,
      border: `1px solid ${theme.panelBorder}`,
      borderRadius: 6,
      padding: "12px 16px 14px",
      color: theme.text,
      fontFamily: "'Archivo', system-ui, sans-serif",
      pointerEvents: "none",
      zIndex: 50,
      minWidth: 230,
      boxShadow: theme.panelShadow,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{
            fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase",
            color: theme.textMuted, fontWeight: 700, marginBottom: 2
          }}>
            Hangar
          </div>
          <div style={{
            fontSize: 28, fontWeight: 800, color: theme.accent,
            lineHeight: 1, letterSpacing: "-0.02em"
          }}>
            {d.number}
          </div>
        </div>
        <StatusDot available={d.available} theme={theme} />
      </div>
      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: `1px solid ${theme.panelBorder}`,
        display: "flex", flexDirection: "column", gap: 5,
        fontSize: 11.5, color: theme.textMuted
      }}>
        <RowMini label="Hangar" value={`${d.hangarSqft.toLocaleString()} sqft`} theme={theme} />
        <RowMini label="Ramp" value={`${d.rampSqft.toLocaleString()} sqft`} theme={theme} />
        <RowMini label="Door" value={`${d.door.width}′ W × ${d.door.height}′ H`} theme={theme} />
      </div>
      <div style={{
        marginTop: 10, fontSize: 9.5, color: theme.accent2,
        letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700
      }}>
        Click for details →
      </div>
    </div>
  );
}

function RowMini({ label, value, theme }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span>{label}</span>
      <span style={{ color: theme.text, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function StatusDot({ available, theme }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: available ? theme.accent2 : theme.textMuted,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: 4,
        background: available ? theme.accent2 : theme.rampFill
      }} />
      {available ? "Avail" : "Leased"}
    </span>
  );
}

// ============================================================
// SIDE PANEL — refined hierarchy, airframe fits, CTA
// ============================================================
function SidePanel({ hangarId, theme, onClose, onQuoteClick, embedded, narrow }) {
  const open = !!hangarId;
  const d = hangarId ? window.HANGAR_DATA[hangarId] : null;
  return (
    <div
      style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0,
        width: narrow ? "100%" : "min(420px, 88%)",
        background: theme.panelBg,
        borderLeft: narrow ? "none" : `1px solid ${theme.panelBorder}`,
        color: theme.text,
        fontFamily: "'Archivo', system-ui, sans-serif",
        transform: open ? "translateX(0)" : "translateX(calc(100% + 20px))",
        opacity: open ? 1 : 0,
        transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease",
        boxShadow: open ? "-12px 0 30px rgba(15,40,80,0.10)" : "none",
        zIndex: 25,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {d && (
        <>
          {/* Top: navy band with hangar number */}
          <div style={{
            background: theme.accent,
            color: "#fff",
            padding: "20px 28px 22px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative corner triangle echo of brand mark */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: 0, height: 0,
              borderStyle: "solid",
              borderWidth: "0 60px 60px 0",
              borderColor: `transparent ${theme.accent2} transparent transparent`,
              opacity: 0.9
            }} />
            <button onClick={onClose} aria-label="Close panel" style={{
              position: "absolute", top: 14, right: 14,
              width: 26, height: 26,
              borderRadius: 13,
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 14, lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
              transition: "background 160ms ease",
              zIndex: 2,
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >✕</button>

            <div style={{
              fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase",
              opacity: 0.7, fontWeight: 700, marginBottom: 6
            }}>
              KCTP · Hangar
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <div style={{
                fontSize: 56, fontWeight: 900,
                lineHeight: 0.9, letterSpacing: "-0.04em",
                fontStyle: "italic"
              }}>
                {d.number}
              </div>
              <StatusPill available={d.available} label={d.availableLabel} />
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 28px 24px" }}>
            {/* Photo placeholder — replace with real images */}
            <div style={{
              height: 152, borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.surfaceCard} 0%, #e9e5dd 100%)`,
              border: `1px solid ${theme.panelBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column", gap: 6,
              fontFamily: "'JetBrains Mono', monospace",
              color: theme.textMuted,
              position: "relative", overflow: "hidden"
            }}>
              <PhotoIcon size={28} color={theme.textFaint} />
              <div style={{ fontSize: 9.5, letterSpacing: "0.16em", fontWeight: 600 }}>
                INTERIOR PHOTO · HGR {d.number}
              </div>
            </div>

            {/* Specs table */}
            <div style={{ marginTop: 22 }}>
              <SectionHeading theme={theme}>Specifications</SectionHeading>
              <SpecRow label="Hangar Floor" value={d.hangarSqft.toLocaleString()} unit="sqft" theme={theme} />
              <SpecRow label="Ramp Apron" value={d.rampSqft.toLocaleString()} unit="sqft" theme={theme} />
              <SpecRow label="Hangar Door" value={`${d.door.width}′ × ${d.door.height}′`} unit="W × H" theme={theme} />
              <SpecRow
                label="Total Footprint"
                value={(d.hangarSqft + d.rampSqft).toLocaleString()}
                unit="sqft"
                theme={theme}
                emphasis
              />
            </div>

            {/* Aircraft fit chips */}
            <div style={{ marginTop: 22 }}>
              <SectionHeading theme={theme}>Aircraft Fit</SectionHeading>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {d.fits.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px",
                    background: theme.surfaceCard,
                    borderLeft: `3px solid ${theme.accent2}`,
                    borderRadius: 2,
                    fontSize: 13, fontWeight: 600, color: theme.text,
                  }}>
                    <CheckIcon size={14} color={theme.accent2} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA block */}
            <div style={{
              marginTop: 24, padding: "18px 18px 20px",
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
              borderRadius: 4, color: "#fff",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{
                fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase",
                opacity: 0.7, fontWeight: 700, marginBottom: 4
              }}>
                Inquire about
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25, marginBottom: 14 }}>
                Lease, transient parking,<br />or scheduled MRO
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onQuoteClick(d.number)} style={{
                  flex: 1, padding: "10px 14px", border: "none", borderRadius: 3,
                  background: "#fff", color: theme.accent,
                  fontFamily: "inherit", fontSize: 11, fontWeight: 800,
                  letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
                }}>
                  Get Quote
                </button>
                <a href={`tel:${window.COMPANY_INFO.aog.replace(/[^\d]/g, "")}`} style={{
                  flex: 1, padding: "10px 14px", borderRadius: 3,
                  background: "rgba(255,255,255,0.12)", color: "#fff",
                  fontFamily: "inherit", fontSize: 11, fontWeight: 800,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  textDecoration: "none", textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.25)"
                }}>
                  Call AOG
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionHeading({ theme, children }) {
  return (
    <div style={{
      fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase",
      color: theme.textMuted, fontWeight: 700,
      paddingBottom: 8, marginBottom: 10,
      borderBottom: `1px solid ${theme.panelBorder}`,
    }}>
      {children}
    </div>
  );
}

function SpecRow({ label, value, unit, theme, emphasis }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "9px 0",
      borderBottom: `1px dashed ${theme.panelBorder}`,
    }}>
      <span style={{
        fontSize: 11, color: theme.textMuted, fontWeight: 600,
        letterSpacing: "0.04em"
      }}>
        {label}
      </span>
      <span>
        <span style={{
          fontSize: emphasis ? 22 : 16, fontWeight: emphasis ? 800 : 700,
          color: emphasis ? theme.accent : theme.text,
          letterSpacing: "-0.01em"
        }}>
          {value}
        </span>
        <span style={{
          fontSize: 10, color: theme.textMuted, marginLeft: 5,
          fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase"
        }}>
          {unit}
        </span>
      </span>
    </div>
  );
}

function StatusPill({ available, label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 9px",
      background: available ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
      borderRadius: 12,
      fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase",
      border: `1px solid rgba(255,255,255,${available ? 0.35 : 0.18})`,
      whiteSpace: "nowrap"
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: 3,
        background: available ? "#7DDFFF" : "rgba(255,255,255,0.4)",
        boxShadow: available ? "0 0 6px #7DDFFF" : "none"
      }} />
      {label}
    </span>
  );
}

function CheckIcon({ size = 14, color = "#1E9FD8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill={color} />
      <path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhotoIcon({ size = 28, color = "#9AA3B2" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" />
      <circle cx="8.5" cy="10.5" r="1.5" fill={color} />
      <path d="M21 16l-5.5-5L9 17.5l-3-3L3 18" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// Quote modal — appears when user clicks "Get a Quote" anywhere
function QuoteModal({ open, hangarPrefill, theme, onClose }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(15,24,40,0.55)",
      backdropFilter: "blur(6px)", zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "kctp-fade-in 240ms ease"
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", width: 480, maxWidth: "90vw",
        borderRadius: 6, padding: "32px 36px 28px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
        fontFamily: "'Archivo', system-ui, sans-serif",
        animation: "kctp-scale-in 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        position: "relative",
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 18, right: 18,
          width: 32, height: 32, borderRadius: 16, border: "none",
          background: theme.surfaceCard, color: theme.textMuted, cursor: "pointer",
          fontSize: 16
        }}>✕</button>
        <div style={{
          fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
          color: theme.accent2, fontWeight: 700, marginBottom: 6
        }}>
          Plane Place Aviation · KCTP
        </div>
        <div style={{
          fontSize: 30, fontWeight: 800, lineHeight: 1.1, color: theme.text,
          letterSpacing: "-0.02em", marginBottom: 6
        }}>
          Request a quote
        </div>
        <div style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.55, marginBottom: 22 }}>
          Tell us about your aircraft and the work scope.
          We respond within one business day — same day for AOG.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Name" theme={theme} />
          <Field label="Company" theme={theme} />
          <Field label="Email" theme={theme} type="email" />
          <Field label="Phone" theme={theme} type="tel" />
          <Field label="Tail Number" theme={theme} />
          <Field label="Hangar of Interest" theme={theme} value={hangarPrefill || ""} />
        </div>
        <div style={{ marginTop: 12 }}>
          <Field label="Scope / Notes" theme={theme} multiline />
        </div>
        <div style={{ marginTop: 18, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "11px 18px", border: `1px solid ${theme.panelBorder}`,
            background: "transparent", color: theme.text, borderRadius: 3,
            fontFamily: "inherit", fontSize: 11.5, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
          }}>Cancel</button>
          <button style={{
            padding: "11px 22px", border: "none",
            background: theme.accent, color: "#fff", borderRadius: 3,
            fontFamily: "inherit", fontSize: 11.5, fontWeight: 800,
            letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
          }}>Send Request</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", theme, multiline, value }) {
  const C = multiline ? "textarea" : "input";
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{
        fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase",
        color: theme.textMuted, fontWeight: 700,
      }}>{label}</span>
      <C
        type={type}
        defaultValue={value}
        rows={multiline ? 3 : undefined}
        style={{
          padding: "10px 12px",
          border: `1px solid ${theme.panelBorder}`,
          borderRadius: 3,
          fontFamily: "'Archivo', system-ui, sans-serif",
          fontSize: 13, color: theme.text,
          background: theme.surfaceCard,
          outline: "none",
          resize: multiline ? "vertical" : "none"
        }}
      />
    </label>
  );
}

Object.assign(window, { HoverTooltip, SidePanel, QuoteModal });
