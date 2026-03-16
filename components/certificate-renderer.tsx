"use client"
// certificate-renderer v2

import type { Participant } from "@/lib/csv-fields"
import type { EventData, Signatory } from "@/lib/certificate-wording"
import { resolveWording } from "@/lib/certificate-wording"
import type { CertificateDesign } from "@/lib/certificate-designs"
import { CERTIFICATE_DESIGNS } from "@/lib/certificate-designs"

export interface CertificateRendererProps {
  designId: number
  participant: Participant
  event: EventData
  wordingTemplate: string
  signatories: Signatory[]
  organizerLogo?: string | null
  sponsorLogos?: string[]
  scale?: number
  customColors?: Record<string, string>
}

const W = 800, H = 566

function HeaderBar({ orgLogo, sponsors }: { orgLogo: string | null; sponsors: string[] }) {
  const has = orgLogo || sponsors.length > 0
  if (!has) return <div style={{ height: 16 }} />
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px 4px", gap: 12, flexShrink: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80 }}>
        {orgLogo && <img src={orgLogo} alt="Organizer" crossOrigin="anonymous" style={{ height: 42, maxWidth: 90, objectFit: "contain" }} />}
        {orgLogo && <div style={{ fontSize: 5.5, color: "#00000055", marginTop: 2, letterSpacing: "0.06em" }}>ORGANIZER</div>}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {sponsors.slice(0, 5).map((l, i) => <img key={i} src={l} alt="Sponsor" crossOrigin="anonymous" style={{ height: 34, maxWidth: 50, objectFit: "contain" }} />)}
        {sponsors.length > 0 && <div style={{ fontSize: 5.5, color: "#00000055", letterSpacing: "0.06em" }}>SPONSORS</div>}
      </div>
    </div>
  )
}

function FooterBar({ sigs, textColor, accentColor }: { sigs: Signatory[]; textColor: string; accentColor: string }) {
  const valid = sigs.filter(x => x.name || x.designation)
  if (!valid.length) return <div style={{ height: 24 }} />
  return (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", padding: "6px 32px 12px", gap: 16, flexShrink: 0 }}>
      {valid.map((sig, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1, minWidth: 100 }}>
          {sig.signatureImage
            ? <img src={sig.signatureImage} alt="" crossOrigin="anonymous" style={{ height: 28, objectFit: "contain", marginBottom: 3 }} />
            : <div style={{ height: 28, marginBottom: 3 }} />}
          <div style={{ width: 90, height: 1, backgroundColor: `${textColor}35` }} />
          <div style={{ fontSize: 8.5, fontWeight: 600, color: textColor, marginTop: 2 }}>{sig.name}</div>
          <div style={{ fontSize: 7, color: `${textColor}70` }}>{sig.designation}</div>
        </div>
      ))}
    </div>
  )
}

interface BodyProps { d: CertificateDesign; body: string; p: Participant; title: string; event: EventData }

/* ── 1: Royal Gold – L-bracket corners + king crown watermark ── */
function D1({ d, body, p, title, event }: BodyProps) {
  const corners = [
    { top: 0, left: 0, borderTop: `3px solid ${d.accentColor}`, borderLeft: `3px solid ${d.accentColor}` },
    { top: 0, right: 0, borderTop: `3px solid ${d.accentColor}`, borderRight: `3px solid ${d.accentColor}` },
    { bottom: 0, left: 0, borderBottom: `3px solid ${d.accentColor}`, borderLeft: `3px solid ${d.accentColor}` },
    { bottom: 0, right: 0, borderBottom: `3px solid ${d.accentColor}`, borderRight: `3px solid ${d.accentColor}` },
  ] as React.CSSProperties[]
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 40px", overflow: "hidden" }}>
      {corners.map((c, i) => <div key={i} style={{ position: "absolute", ...c, width: 40, height: 40 }} />)}
      <svg style={{ position: "absolute", opacity: 0.04 }} width="140" height="140" viewBox="0 0 24 24" fill={d.accentColor}><path d="M3 18H21V20H3V18ZM5 16L3 8L8 12L12 4L16 12L21 8L19 16H5Z" /></svg>
      <div style={{ fontSize: 9, color: d.headerColor, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: d.accentColor, fontFamily: "Georgia,serif", letterSpacing: "0.02em" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 55, height: 1.5, background: d.accentColor }} />
        <div style={{ width: 7, height: 7, transform: "rotate(45deg)", background: d.accentColor, opacity: 0.6 }} />
        <div style={{ width: 55, height: 1.5, background: d.accentColor }} />
      </div>
      <div style={{ fontSize: 9.5, color: `${d.textColor}80`, fontStyle: "italic" }}>This certificate is proudly presented to</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: d.textColor, fontFamily: "Georgia,serif", borderBottom: `2px solid ${d.accentColor}`, paddingBottom: 4 }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 500, lineHeight: 1.75 }}>{body}</div>
    </div>
  )
}

/* ── 2: Deep Maroon – full left color panel + white text panel ── */
function D2({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ width: 190, background: `linear-gradient(180deg, ${d.headerColor}, ${d.accentColor})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "16px 14px", flexShrink: 0 }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#ffffff60" strokeWidth="1"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 12, textAlign: "center", letterSpacing: "0.05em", lineHeight: 1.4 }}>{title.toUpperCase()}</div>
        <div style={{ width: 40, height: 1.5, background: "#ffffff50" }} />
        <div style={{ color: "#ffffffCC", fontSize: 7.5, textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>{event.tournamentName}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7, padding: "16px 28px", background: d.bgColor }}>
        <div style={{ fontSize: 8.5, color: `${d.textColor}70`, letterSpacing: "0.12em", textTransform: "uppercase" }}>This is to certify that</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: d.textColor, fontFamily: "Georgia,serif" }}>{p.title} {p.name}</div>
        <div style={{ width: 50, height: 2, background: d.accentColor }} />
        <div style={{ fontSize: 10, color: `${d.textColor}B0`, lineHeight: 1.75, maxWidth: 440 }}>{body}</div>
      </div>
    </div>
  )
}

/* ── 3: Wooden Board – chess-notation background watermark ── */
function D3({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, fontSize: 8, lineHeight: 2.8, color: d.textColor, opacity: 0.03, fontFamily: "monospace", padding: 8, overflow: "hidden", wordBreak: "break-all" }}>
        {"1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O 9.h3 Nb8 10.d4 Nbd7 ".repeat(25)}
      </div>
      <div style={{ fontSize: 9, color: `${d.headerColor}CC`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: d.accentColor, fontFamily: "Georgia,serif", position: "relative" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
        <div style={{ width: 55, height: 1, background: `${d.accentColor}50` }} />
        <span style={{ fontSize: 20, color: `${d.accentColor}80` }}>♞</span>
        <div style={{ width: 55, height: 1, background: `${d.accentColor}50` }} />
      </div>
      <div style={{ fontSize: 9.5, color: `${d.textColor}80`, position: "relative" }}>This is to certify that</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.textColor, fontFamily: "Georgia,serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 500, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 4: Minimalist – hairline borders + wide letter-spacing, top/bottom ruled ── */
function D4({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 48px", borderTop: `1px solid ${d.accentColor}30`, borderBottom: `1px solid ${d.accentColor}30`, margin: "8px 24px" }}>
      <div style={{ fontSize: 7.5, color: `${d.textColor}60`, letterSpacing: "0.3em", textTransform: "uppercase" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 28, fontWeight: 300, color: d.textColor, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</div>
      <div style={{ width: 28, height: 1, background: d.accentColor }} />
      <div style={{ fontSize: 8.5, color: `${d.textColor}60`, fontVariant: "small-caps", letterSpacing: "0.08em" }}>is hereby conferred upon</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: d.textColor, fontFamily: "Georgia,serif", letterSpacing: "0.01em" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}90`, textAlign: "center", maxWidth: 480, lineHeight: 1.8 }}>{body}</div>
    </div>
  )
}

/* ── 5: FIDE Blue – dot-grid bg + gradient horizontal accent stripe ── */
function D5({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${d.accentColor}22 1px, transparent 0)`, backgroundSize: "18px 18px" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${d.accentColor}, transparent)` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${d.accentColor}, transparent)` }} />
      <div style={{ fontSize: 9, color: `${d.headerColor}CC`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ width: 60, height: 2, background: `${d.accentColor}60`, position: "relative" }} />
      <div style={{ fontSize: 9.5, color: `${d.textColor}80`, position: "relative" }}>This certificate is presented to</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.textColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 500, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 6: Speed Red – bold full-width top banner + angled stripe ── */
function D6({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ background: d.accentColor, padding: "10px 28px 8px", flexShrink: 0 }}>
        <div style={{ fontSize: 8, color: "#ffffffB0", letterSpacing: "0.16em", textTransform: "uppercase" }}>{event.tournamentName}</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.1 }}>{title}</div>
      </div>
      {/* Diagonal ribbon */}
      <div style={{ position: "absolute", top: 56, right: -18, width: 160, height: 18, background: `${d.accentColor}25`, transform: "rotate(-4deg)" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 28px" }}>
        <div style={{ fontSize: 9.5, color: `${d.textColor}75` }}>Presented to</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: d.textColor }}>{p.title} {p.name}</div>
        <div style={{ width: 55, height: 2.5, background: d.accentColor, borderRadius: 2 }} />
        <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 500, lineHeight: 1.75 }}>{body}</div>
      </div>
    </div>
  )
}

/* ── 7: Checkmate Split – RIGHT rank panel with big position number ── */
function D7({ d, body, p, title, event }: BodyProps) {
  const rank = parseInt(p.position) || 0
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : ""
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 24px" }}>
        <div style={{ fontSize: 8.5, color: `${d.headerColor}B0`, letterSpacing: "0.14em", textTransform: "uppercase" }}>{event.tournamentName}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: d.accentColor }}>{title}</div>
        <div style={{ width: 55, height: 2, background: `${d.accentColor}50` }} />
        <div style={{ fontSize: 9.5, color: `${d.textColor}75` }}>This certificate is presented to</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: d.textColor }}>{p.title} {p.name}</div>
        <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 400, lineHeight: 1.75 }}>{body}</div>
      </div>
      <div style={{ width: 90, background: d.accentColor, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: 2 }}>
        {medal
          ? <div style={{ fontSize: 32, lineHeight: 1 }}>{medal}</div>
          : <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1 }}>#{rank || "–"}</div>
        }
        <div style={{ fontSize: 7, color: "#ffffffA0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Rank</div>
        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
          {"♚♛♜♝♞♟".split("").map((c, i) => <span key={i} style={{ fontSize: 13, color: "#ffffff25", textAlign: "center" }}>{c}</span>)}
        </div>
      </div>
    </div>
  )
}

/* ── 8: Emerald Classic – inset double-frame + fleuron ornaments ── */
function D8({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "18px 30px", margin: "6px" }}>
      <div style={{ position: "absolute", inset: 4, border: `2px solid ${d.accentColor}60`, borderRadius: 3 }} />
      <div style={{ position: "absolute", inset: 9, border: `1px solid ${d.accentColor}25`, borderRadius: 1 }} />
      <div style={{ fontSize: 9, color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.accentColor, fontFamily: "Georgia,serif", position: "relative" }}>{title}</div>
      <div style={{ fontSize: 22, color: `${d.accentColor}30`, position: "relative", lineHeight: 1 }}>❧ ✦ ❧</div>
      <div style={{ fontSize: 9.5, color: `${d.textColor}75`, position: "relative" }}>Proudly awarded to</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.textColor, fontFamily: "Georgia,serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 480, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 9: Grandmaster Gold – radial glow corners + triple dot divider ── */
function D9({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -40, left: -40, width: 120, height: 120, background: `radial-gradient(circle, ${d.accentColor}22, transparent 70%)`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: -30, right: -30, width: 100, height: 100, background: `radial-gradient(circle, ${d.accentColor}18, transparent 70%)`, borderRadius: "50%" }} />
      <div style={{ fontSize: 9, color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: d.accentColor, fontFamily: "Georgia,serif", position: "relative" }}>{title}</div>
      <div style={{ display: "flex", gap: 6, position: "relative" }}>
        {[0.3, 0.55, 0.8].map((o, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: d.accentColor, opacity: o }} />)}
      </div>
      <div style={{ fontSize: 9.5, color: `${d.textColor}75`, position: "relative" }}>This certificate honours</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.textColor, fontFamily: "Georgia,serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 500, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 10: Dark Knight – near-black bg, gold on dark, giant knight watermark ── */
function D10({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 32px", overflow: "hidden", background: d.bgColor }}>
      <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", fontSize: 160, color: `${d.accentColor}08`, lineHeight: 1, fontFamily: "serif" }}>♞</div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${d.accentColor}, transparent)` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${d.accentColor}, transparent)` }} />
      <div style={{ fontSize: 8.5, color: `${d.accentColor}90`, letterSpacing: "0.2em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: d.accentColor, letterSpacing: "0.05em", position: "relative" }}>{title}</div>
      <div style={{ width: 55, height: 2, background: d.accentColor, position: "relative" }} />
      <div style={{ fontSize: 9.5, color: `${d.textColor}70`, position: "relative" }}>Awarded to</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.accentColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}A0`, textAlign: "center", maxWidth: 480, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 11: Black & Gold Elite – corner triangle fills + diagonal accent lines ── */
function D11({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "20px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: `60px solid ${d.headerColor}`, borderRight: "60px solid transparent" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTop: `60px solid ${d.headerColor}`, borderLeft: "60px solid transparent" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 0, height: 0, borderBottom: `60px solid ${d.headerColor}`, borderRight: "60px solid transparent" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 0, height: 0, borderBottom: `60px solid ${d.headerColor}`, borderLeft: "60px solid transparent" }} />
      <div style={{ position: "absolute", top: 6, left: 6, width: 48, height: 1, background: d.accentColor, transform: "rotate(45deg)", transformOrigin: "top left" }} />
      <div style={{ position: "absolute", top: 6, right: 6, width: 48, height: 1, background: d.accentColor, transform: "rotate(-45deg)", transformOrigin: "top right" }} />
      <div style={{ fontSize: 9, color: `${d.headerColor}CC`, letterSpacing: "0.2em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ fontSize: 22, color: `${d.accentColor}28`, position: "relative" }}>✦ ✦ ✦</div>
      <div style={{ fontSize: 9.5, color: `${d.textColor}75`, position: "relative" }}>is proudly presented to</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.textColor, borderBottom: `2px solid ${d.accentColor}`, paddingBottom: 4, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 480, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 12: Checkered Border – chessboard edge tiles + clean inner ── */
function D12({ d, body, p, title, event }: BodyProps) {
  const sq = 9
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "26px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-conic-gradient(${d.headerColor} 0% 25%, ${d.bgColor} 0% 50%)`, backgroundSize: `${sq * 2}px ${sq * 2}px` }} />
      <div style={{ position: "absolute", inset: `${sq * 2 + 4}px`, background: d.bgColor, border: `1.5px solid ${d.accentColor}50`, borderRadius: 2 }} />
      <div style={{ fontSize: 9, color: `${d.headerColor}CC`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.accentColor, fontFamily: "Georgia,serif", position: "relative" }}>{title}</div>
      <div style={{ fontSize: 9.5, color: `${d.textColor}75`, position: "relative" }}>This is to certify that</div>
      <div style={{ fontSize: 25, fontWeight: 700, color: d.textColor, textDecoration: "underline", textDecorationColor: `${d.accentColor}50`, textUnderlineOffset: 5, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 440, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 13: Pawn Stars Kids – scattered stars + bubbly rainbow badge ── */
function D13({ d, body, p, title, event }: BodyProps) {
  const stars = [
    { top: "8%", left: "3%", sz: 18, col: "#FFD700" }, { top: "5%", right: "4%", sz: 14, col: "#FF6B6B" },
    { bottom: "12%", left: "5%", sz: 12, col: "#4ECDC4" }, { bottom: "8%", right: "6%", sz: 16, col: "#A78BFA" },
    { top: "42%", left: "2%", sz: 10, col: "#F59E0B" }, { top: "38%", right: "2%", sz: 11, col: "#EC4899" },
    { top: "3%", left: "45%", sz: 9, col: "#34D399" }, { bottom: "20%", left: "50%", sz: 13, col: "#F97316" },
  ] as { top?: string; bottom?: string; left?: string; right?: string; sz: number; col: string }[]
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "14px 28px", overflow: "hidden", background: `linear-gradient(135deg, ${d.bgColor} 60%, ${d.accentColor}12)` }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position: "absolute", top: s.top, bottom: s.bottom, left: s.left, right: s.right, fontSize: s.sz, color: s.col, opacity: 0.5, lineHeight: 1 }}>★</div>
      ))}
      <div style={{ fontSize: 9, color: `${d.headerColor}CC`, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 27, fontWeight: 800, color: d.accentColor, position: "relative", letterSpacing: "0.02em" }}>~ {title} ~</div>
      <div style={{ fontSize: 10, color: `${d.textColor}85`, position: "relative" }}>Super Star Award for</div>
      <div style={{ fontSize: 25, fontWeight: 800, color: d.headerColor, position: "relative", padding: "5px 22px", borderRadius: 12, background: `${d.accentColor}18`, border: `2px dashed ${d.accentColor}45` }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 480, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 14: Trophy Gold Kids – large trophy SVG + confetti dots ── */
function D14({ d, body, p, title, event }: BodyProps) {
  const dots = [
    { top: "8px", left: "30px", c: "#FFD700" }, { top: "18px", right: "38px", c: "#FF6B6B" },
    { bottom: "22px", left: "48px", c: "#4ECDC4" }, { bottom: "14px", right: "32px", c: "#A78BFA" },
    { top: "35%", left: "12px", c: "#34D399" }, { bottom: "30%", right: "16px", c: "#F97316" },
  ] as React.CSSProperties[]
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px 28px", overflow: "hidden" }}>
      <svg style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", opacity: 0.06 }} width="170" height="170" viewBox="0 0 24 24" fill={d.accentColor}><path d="M18 2c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1v3c0 1.66-1.34 3-3 3h-.17A5.991 5.991 0 0 1 13 16.92V19h4v2H7v-2h4v-2.08A5.991 5.991 0 0 1 5.17 12H5c-1.66 0-3-1.34-3-3V6c0-.55.45-1 1-1h2V3c0-.55.45-1 1-1h12Z"/></svg>
      {dots.map((dot, i) => <div key={i} style={{ position: "absolute", ...dot, width: 9, height: 9, borderRadius: "50%", opacity: 0.25 }} />)}
      <div style={{ fontSize: 9, color: `${d.headerColor}CC`, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 27, fontWeight: 800, color: d.accentColor, position: "relative" }}>★ {title} ★</div>
      <div style={{ fontSize: 10, color: `${d.textColor}85`, position: "relative" }}>This awesome certificate goes to</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: d.headerColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ width: 50, height: 3, borderRadius: 2, background: d.accentColor, position: "relative" }} />
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 480, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 15: Checkered Flag Kids – checkerboard border + racing feel ── */
function D15({ d, body, p, title, event }: BodyProps) {
  const sq = 8
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "24px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-conic-gradient(${d.headerColor} 0% 25%, ${d.bgColor} 0% 50%)`, backgroundSize: `${sq * 2}px ${sq * 2}px` }} />
      <div style={{ position: "absolute", inset: `${sq * 2 + 4}px`, background: d.bgColor, border: `2px solid ${d.accentColor}40`, borderRadius: 8 }} />
      <div style={{ fontSize: 9, color: `${d.headerColor}CC`, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}80`, position: "relative" }}>Young Champion Award for</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: d.textColor, textDecoration: "underline", textDecorationColor: `${d.accentColor}50`, textUnderlineOffset: 4, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 420, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 16: Knight Quest Kids – rainbow stripe bars + dashed border + big knight ── */
function D16({ d, body, p, title, event }: BodyProps) {
  const rainbow = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#A78BFA", "#FF9A8B"]
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "18px 28px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 7, display: "flex" }}>
        {rainbow.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 7, display: "flex" }}>
        {rainbow.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
      </div>
      <div style={{ position: "absolute", inset: 12, border: `2px dashed ${d.accentColor}35`, borderRadius: 12 }} />
      <div style={{ position: "absolute", fontSize: 55, color: `${d.textColor}07`, lineHeight: 1, fontFamily: "serif" }}>♞</div>
      <div style={{ fontSize: 9, color: `${d.headerColor}CC`, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}80`, position: "relative" }}>Rising Star Award for</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: d.textColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 460, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 17: Indian Tricolor – saffron/white/green bars + Ashoka wheel divider ── */
function D17({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "linear-gradient(90deg, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)" }} />
      <div style={{ fontSize: 9, color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>
        <div style={{ width: 50, height: 1.5, background: "#FF9933" }} />
        <div style={{ width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #000080" }} />
        <div style={{ width: 50, height: 1.5, background: "#138808" }} />
      </div>
      <div style={{ fontSize: 9.5, color: `${d.textColor}75`, position: "relative" }}>This certificate is presented to</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.textColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 500, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 18: Lions Club – diagonal sweep gradient + curved bottom accent ── */
function D18({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", background: `linear-gradient(135deg, ${d.accentColor}14, transparent 80%)` }} />
      <div style={{ position: "absolute", bottom: -30, right: -30, width: 120, height: 120, border: `2px solid ${d.accentColor}20`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: -15, right: -15, width: 80, height: 80, border: `1.5px solid ${d.accentColor}15`, borderRadius: "50%" }} />
      <div style={{ fontSize: 9, color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ width: 70, height: 2, background: d.accentColor, borderRadius: 1, position: "relative" }} />
      <div style={{ fontSize: 9.5, color: `${d.textColor}75`, position: "relative" }}>Presented to</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.textColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 500, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ── 19: Federation Style – bold ALL-CAPS header + horizontal stripe accent ── */
function D19({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ background: `${d.headerColor}`, padding: "8px 28px 6px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 7.5, color: "#ffffffA0", letterSpacing: "0.18em", textTransform: "uppercase" }}>{event.tournamentName}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.1 }}>{title}</div>
        </div>
        <div style={{ width: 48, height: 48, border: "2px solid #ffffff30", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 24, color: "#ffffff40", fontFamily: "serif" }}>♛</span>
        </div>
      </div>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${d.accentColor}, ${d.accentColor}50, transparent)` }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7, padding: "10px 28px" }}>
        <div style={{ fontSize: 8.5, color: `${d.textColor}70`, letterSpacing: "0.12em", textTransform: "uppercase" }}>Awarded to</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: d.textColor, fontFamily: "Georgia,serif" }}>{p.title} {p.name}</div>
        <div style={{ width: 55, height: 2, background: d.accentColor }} />
        <div style={{ fontSize: 10, color: `${d.textColor}B0`, lineHeight: 1.75, maxWidth: 480 }}>{body}</div>
      </div>
    </div>
  )
}

/* ── 20: Association Classic – ornate triple-frame + floral filigree ── */
function D20({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: "20px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 5, border: `2.5px solid ${d.accentColor}`, borderRadius: 3 }} />
      <div style={{ position: "absolute", inset: 10, border: `1px solid ${d.accentColor}50` }} />
      <div style={{ position: "absolute", inset: 15, border: `0.5px solid ${d.accentColor}25` }} />
      {/* Corner ornaments */}
      {([{top:8,left:8},{top:8,right:8},{bottom:8,left:8},{bottom:8,right:8}] as React.CSSProperties[]).map((s,i)=>(
        <div key={i} style={{position:"absolute",...s,fontSize:9,color:`${d.accentColor}50`,lineHeight:1}}>✦</div>
      ))}
      <div style={{ fontSize: 9, color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: d.accentColor, fontFamily: "Georgia,serif", fontStyle: "italic", position: "relative" }}>{title}</div>
      <div style={{ fontSize: 18, color: `${d.accentColor}35`, position: "relative", lineHeight: 1 }}>❧ ✾ ❧</div>
      <div style={{ fontSize: 9.5, color: `${d.textColor}75`, position: "relative" }}>This certificate is awarded to</div>
      <div style={{ fontSize: 25, fontWeight: 700, color: d.textColor, fontFamily: "Georgia,serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: 10, color: `${d.textColor}B0`, textAlign: "center", maxWidth: 460, lineHeight: 1.75, position: "relative" }}>{body}</div>
    </div>
  )
}

const BODY_MAP: Record<number, React.ComponentType<BodyProps>> = {
  1: D1, 2: D2, 3: D3, 4: D4, 5: D5, 6: D6, 7: D7, 8: D8, 9: D9, 10: D10,
  11: D11, 12: D12, 13: D13, 14: D14, 15: D15, 16: D16, 17: D17, 18: D18, 19: D19, 20: D20,
}

/* ============================================================
   MAIN RENDERER
   ============================================================ */
export function CertificateRenderer({ designId, participant, event, wordingTemplate, signatories, organizerLogo, sponsorLogos = [], scale = 1, customColors }: CertificateRendererProps) {
  const design = CERTIFICATE_DESIGNS.find(d => d.id === designId) || CERTIFICATE_DESIGNS[0]
  const d = customColors
    ? { ...design, accentColor: customColors.accentColor || design.accentColor, headerColor: customColors.headerColor || design.headerColor, bgColor: customColors.bgColor || design.bgColor, textColor: customColors.textColor || design.textColor, borderColor: customColors.borderColor || design.borderColor }
    : design
  const body = resolveWording(wordingTemplate, participant, event)
  const title = "Certificate of " + (parseInt(participant.position) <= 3 ? "Merit" : "Participation")
  const BodyComponent = BODY_MAP[designId] || D1

  return (
    <div style={{ width: Math.round(W * scale), height: Math.round(H * scale), overflow: "hidden", flexShrink: 0 }}>
      <div data-certificate style={{
        width: W, height: H,
        backgroundColor: d.bgColor,
        border: `2px solid ${d.borderColor}`,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}>
        <HeaderBar orgLogo={organizerLogo || null} sponsors={sponsorLogos} />
        <BodyComponent d={d} body={body} p={participant} title={title} event={event} />
        <FooterBar sigs={signatories} textColor={d.textColor} accentColor={d.accentColor} />
      </div>
    </div>
  )
}

/* ============================================================
   PDF DOWNLOAD
   ============================================================ */
export async function downloadCertificateAsPDF(containerEl: HTMLDivElement | null, filename: string): Promise<boolean> {
  if (!containerEl) return false
  const certEl = containerEl.querySelector("[data-certificate]") as HTMLElement
  if (!certEl) return false
  try {
    const origTransform = certEl.style.transform
    certEl.style.transform = "none"
    const { default: html2canvas } = await import("html2canvas")
    const { default: jsPDF } = await import("jspdf")
    const canvas = await html2canvas(certEl, { scale: 3, useCORS: true, backgroundColor: null })
    certEl.style.transform = origTransform
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] })
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.save(`${filename}.pdf`)
    return true
  } catch (e) { console.error("PDF download failed:", e); return false }
}

/* ============================================================
   THUMBNAIL – renders a real mini certificate preview
   ============================================================ */
export function CertificateThumbnail({ designId, colors, isSelected, onClick }: {
  designId: number; colors?: Record<string, string>; isSelected?: boolean; onClick?: () => void
}) {
  const design = CERTIFICATE_DESIGNS.find(d => d.id === designId) || CERTIFICATE_DESIGNS[0]
  const d = colors
    ? { ...design, accentColor: colors.accentColor || design.accentColor, bgColor: colors.bgColor || design.bgColor, headerColor: colors.headerColor || design.headerColor, textColor: colors.textColor || design.textColor, borderColor: colors.borderColor || design.borderColor }
    : design

  // Tiny mock data for thumbnail
  const mockP: Participant = { name: "Priya Sharma", title: "Ms.", position: "1", category: "Open", points: "8.5", gender: "Female", affiliation: "", rounds: "11" }
  const mockEvent: EventData = { tournamentName: "National Championship", venue: "Mumbai", startDate: "01/01/25", endDate: "05/01/25", isSingleDay: false, totalRounds: "11" }
  const mockSigs: Signatory[] = []
  const mockWording = "for outstanding performance in the tournament."
  const S = 130 / W  // thumbnail scale
  const BodyComp = BODY_MAP[designId] || D1

  return (
    <button onClick={onClick} style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 130, height: 92,
        position: "relative", overflow: "hidden",
        borderRadius: 6,
        outline: isSelected ? `2.5px solid ${d.accentColor}` : `1.5px solid ${d.borderColor}50`,
        boxShadow: isSelected ? `0 0 0 3px ${d.accentColor}30` : "0 1px 4px rgba(0,0,0,0.10)",
        transition: "all 0.15s",
      }}>
        <div style={{ transform: `scale(${S})`, transformOrigin: "top left", width: W, height: H, pointerEvents: "none" }}>
          <div style={{ width: W, height: H, backgroundColor: d.bgColor, border: `2px solid ${d.borderColor}`, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "system-ui,sans-serif" }}>
            <HeaderBar orgLogo={null} sponsors={[]} />
            <BodyComp
              d={d} body={mockWording} p={mockP} title="Certificate of Merit" event={mockEvent}
            />
            <FooterBar sigs={mockSigs} textColor={d.textColor} accentColor={d.accentColor} />
          </div>
        </div>
      </div>
      <span style={{ fontSize: 10, color: isSelected ? d.accentColor : "#666", fontWeight: isSelected ? 600 : 400, textAlign: "center", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {design.name}
      </span>
    </button>
  )
}
