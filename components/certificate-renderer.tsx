"use client"

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

/* ============================================================
   HEADER: ONLY logos - organizer left, sponsors right. NO text.
   ============================================================ */
function HeaderBar({ orgLogo, sponsors }: {
  orgLogo: string | null; sponsors: string[]
}) {
  const hasContent = orgLogo || sponsors.length > 0
  if (!hasContent) return <div style={{ height: "20px" }} />
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 24px 4px", gap: "12px", flexShrink: 0 }}>
      {/* Organizer logo - left */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
        {orgLogo ? (
          <img src={orgLogo} alt="Organizer" crossOrigin="anonymous" style={{ height: "42px", maxWidth: "90px", objectFit: "contain" }} />
        ) : (
          <div style={{ width: "42px", height: "42px" }} />
        )}
        {orgLogo && <div style={{ fontSize: "5.5px", color: "#00000060", marginTop: "2px", letterSpacing: "0.05em" }}>ORGANIZER</div>}
      </div>

      {/* Center spacer */}
      <div style={{ flex: 1 }} />

      {/* Sponsor logos - right */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "80px", justifyContent: "flex-end", flexWrap: "wrap" }}>
        {sponsors.slice(0, 5).map((l, i) => (
          <img key={i} src={l} alt="Sponsor" crossOrigin="anonymous" style={{ height: "36px", maxWidth: "50px", objectFit: "contain" }} />
        ))}
        {sponsors.length > 0 && <div style={{ fontSize: "5.5px", color: "#00000060", position: "absolute", bottom: "1px", right: "24px", letterSpacing: "0.05em" }}>SPONSORS</div>}
      </div>
    </div>
  )
}

/* ============================================================
   FOOTER: Signatories with signature images
   ============================================================ */
function FooterBar({ sigs, textColor, accentColor }: { sigs: Signatory[]; textColor: string; accentColor: string }) {
  const valid = sigs.filter(x => x.name || x.designation)
  if (!valid.length) return <div style={{ height: "30px" }} />
  return (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", width: "100%", padding: "6px 32px 12px", gap: "16px", flexShrink: 0 }}>
      {valid.map((sig, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1px", minWidth: "100px" }}>
          {sig.signatureImage ? (
            <img src={sig.signatureImage} alt="" crossOrigin="anonymous" style={{ height: "28px", objectFit: "contain", marginBottom: "3px" }} />
          ) : (
            <div style={{ height: "28px", marginBottom: "3px" }} />
          )}
          <div style={{ width: "90px", height: "1px", backgroundColor: `${textColor}40` }} />
          <div style={{ fontSize: "8.5px", fontWeight: 600, color: textColor, marginTop: "2px" }}>{sig.name}</div>
          <div style={{ fontSize: "7px", color: `${textColor}70` }}>{sig.designation}</div>
        </div>
      ))}
    </div>
  )
}

/* ============================================================
   BODY DESIGNS (1-20): Each is truly unique in structure.
   Body includes: tournament name, title, name, wording
   ============================================================ */
interface BodyProps { d: CertificateDesign; body: string; p: Participant; title: string; event: EventData }

/* ---------- 1: Royal Gold - gold L-bracket corners + king watermark + centered layout ---------- */
function D1({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "12px 28px", overflow: "hidden" }}>
      {/* Gold L-bracket corners */}
      {[{ t: 0, l: 0, bt: "3px", bl: "3px" }, { t: 0, r: 0, bt: "3px", br: "3px" }, { b: 0, l: 0, bb: "3px", bl: "3px" }, { b: 0, r: 0, bb: "3px", br: "3px" }].map((c, i) => (
        <div key={i} style={{ position: "absolute", top: c.t != null ? 0 : undefined, bottom: (c as any).b != null ? 0 : undefined, left: c.l != null ? 0 : undefined, right: (c as any).r != null ? 0 : undefined, width: "35px", height: "35px", borderTop: c.bt ? `${c.bt} solid ${d.accentColor}` : undefined, borderBottom: (c as any).bb ? `${(c as any).bb} solid ${d.accentColor}` : undefined, borderLeft: c.bl ? `${c.bl} solid ${d.accentColor}` : undefined, borderRight: (c as any).br ? `${(c as any).br} solid ${d.accentColor}` : undefined }} />
      ))}
      {/* King watermark */}
      <svg style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", opacity: 0.05 }} width="130" height="130" viewBox="0 0 24 24" fill={d.accentColor}><path d="M3 18H21V20H3V18ZM5 16L3 8L8 12L12 4L16 12L21 8L19 16H5Z" /></svg>
      <div style={{ fontSize: "11px", color: `${d.headerColor}`, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: d.accentColor, letterSpacing: "0.03em", fontFamily: "Georgia, serif", position: "relative" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
        <div style={{ width: "50px", height: "1.5px", backgroundColor: d.accentColor }} />
        <div style={{ width: "6px", height: "6px", transform: "rotate(45deg)", backgroundColor: d.accentColor, opacity: 0.5 }} />
        <div style={{ width: "50px", height: "1.5px", backgroundColor: d.accentColor }} />
      </div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, fontStyle: "italic", position: "relative" }}>This certificate is proudly presented to</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.textColor, borderBottom: `2px solid ${d.accentColor}`, paddingBottom: "4px", fontFamily: "Georgia, serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "500px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 2: Maroon Heritage - double ruled lines + serif italic ---------- */
function D2({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "16px 32px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "20px", right: "20px", height: "3px", backgroundColor: d.accentColor }} />
      <div style={{ position: "absolute", top: "6px", left: "20px", right: "20px", height: "1px", backgroundColor: `${d.accentColor}50` }} />
      <div style={{ position: "absolute", bottom: 0, left: "20px", right: "20px", height: "3px", backgroundColor: d.accentColor }} />
      <div style={{ position: "absolute", bottom: "6px", left: "20px", right: "20px", height: "1px", backgroundColor: `${d.accentColor}50` }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}CC`, letterSpacing: "0.2em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "30px", fontWeight: 700, fontStyle: "italic", color: d.accentColor, fontFamily: "Georgia, serif", position: "relative" }}>{title}</div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>Awarded to</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.textColor, fontFamily: "Georgia, serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ width: "100px", height: "2px", backgroundColor: `${d.accentColor}50`, position: "relative" }} />
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "500px", lineHeight: 1.7, fontFamily: "Georgia, serif", position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 3: Wooden Board - chess notation watermark + warm serif ---------- */
function D3({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "12px 24px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, fontSize: "9px", lineHeight: 2.5, color: d.textColor, overflow: "hidden", fontFamily: "monospace", padding: "6px" }}>
        {"1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7 6.Re1 b5 7.Bb3 d6 8.c3 O-O ".repeat(20)}
      </div>
      <div style={{ fontSize: "10px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: d.accentColor, fontFamily: "Georgia, serif", position: "relative" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}><div style={{ width: "50px", height: "1px", backgroundColor: `${d.accentColor}50` }} /><span style={{ fontSize: "18px", color: `${d.accentColor}80` }}>{"\u265E"}</span><div style={{ width: "50px", height: "1px", backgroundColor: `${d.accentColor}50` }} /></div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>This is to certify that</div>
      <div style={{ fontSize: "25px", fontWeight: 700, color: d.textColor, fontFamily: "Georgia, serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "500px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 4: Opening Moves - minimal small-caps + clean modern ---------- */
function D4({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px 24px" }}>
      <div style={{ fontSize: "9px", color: `${d.textColor}90`, letterSpacing: "0.2em", textTransform: "uppercase" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.accentColor, fontVariant: "small-caps", letterSpacing: "0.1em" }}>{title}</div>
      <div style={{ width: "50px", height: "2px", backgroundColor: d.accentColor }} />
      <div style={{ fontSize: "9px", color: `${d.textColor}80`, fontVariant: "small-caps", letterSpacing: "0.06em" }}>is hereby conferred upon</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.textColor, fontFamily: "Georgia, serif" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "480px", lineHeight: 1.7 }}>{body}</div>
    </div>
  )
}

/* ---------- 5: FIDE Blue - dot grid + gradient top line ---------- */
function D5({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "12px 24px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${d.accentColor}25 1px, transparent 0)`, backgroundSize: "16px 16px", opacity: 0.2 }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, transparent, ${d.accentColor}, transparent)` }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}CC`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ width: "60px", height: "2px", backgroundColor: `${d.accentColor}60`, position: "relative" }} />
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>This certificate is presented to</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.textColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "500px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 6: Checkmate Split - LEFT color panel with chess pieces ---------- */
function D6({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ width: "80px", backgroundColor: d.accentColor, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", flexShrink: 0 }}>
        {["\u265A", "\u265E", "\u265B", "\u265C", "\u265D"].map((c, i) => <span key={i} style={{ fontSize: "20px", color: "#ffffff50" }}>{c}</span>)}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 20px" }}>
        <div style={{ fontSize: "9px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase" }}>{event.tournamentName}</div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: d.accentColor }}>{title}</div>
        <div style={{ width: "60px", height: "2px", backgroundColor: `${d.accentColor}50` }} />
        <div style={{ fontSize: "10px", color: `${d.textColor}80` }}>This certificate is presented to</div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: d.textColor }}>{p.title} {p.name}</div>
        <div style={{ fontSize: "10px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "400px", lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  )
}

/* ---------- 7: Speed Red - bold top banner + diagonal accent ---------- */
function D7({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ backgroundColor: d.accentColor, padding: "10px 24px", textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: "9px", color: "#ffffffBB", letterSpacing: "0.15em", textTransform: "uppercase" }}>{event.tournamentName}</div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
      </div>
      <div style={{ position: "absolute", top: "50px", right: 0, width: "140px", height: "140px", backgroundColor: `${d.accentColor}08`, transform: "rotate(45deg)", transformOrigin: "top right" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "12px 24px" }}>
        <div style={{ fontSize: "10px", color: `${d.textColor}80` }}>Presented to</div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: d.textColor }}>{p.title} {p.name}</div>
        <div style={{ width: "60px", height: "2px", backgroundColor: d.accentColor }} />
        <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "500px", lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  )
}

/* ---------- 8: Emerald Classic - inset double border + laurel wreath ---------- */
function D8({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "16px 24px", margin: "6px" }}>
      <div style={{ position: "absolute", inset: "5px", border: `2px solid ${d.accentColor}40`, borderRadius: "4px" }} />
      <div style={{ position: "absolute", inset: "10px", border: `1px solid ${d.accentColor}20`, borderRadius: "2px" }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.accentColor, fontFamily: "Georgia, serif", position: "relative" }}>{title}</div>
      <div style={{ fontSize: "30px", color: `${d.accentColor}25`, position: "relative" }}>{"\u2766"}</div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>Proudly awarded to</div>
      <div style={{ fontSize: "25px", fontWeight: 700, color: d.textColor, fontFamily: "Georgia, serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "480px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 9: Grandmaster Gold - gradient corner circles + bold serif ---------- */
function D9({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "12px 24px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-25px", left: "-25px", width: "100px", height: "100px", background: `radial-gradient(circle, ${d.accentColor}20, transparent 70%)`, borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "-25px", right: "-25px", width: "90px", height: "90px", background: `radial-gradient(circle, ${d.accentColor}20, transparent 70%)`, borderRadius: "50%" }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: d.accentColor, fontFamily: "Georgia, serif", position: "relative" }}>{title}</div>
      <div style={{ display: "flex", gap: "5px", position: "relative" }}>{[0, 1, 2].map(i => <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: d.accentColor, opacity: 0.3 + i * 0.2 }} />)}</div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>This certificate honors</div>
      <div style={{ fontSize: "25px", fontWeight: 700, color: d.textColor, fontFamily: "Georgia, serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "500px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 10: Dark Knight - dark bg, gold text, large knight watermark ---------- */
function D10({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "12px 24px", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: "30px", top: "50%", transform: "translateY(-50%)", fontSize: "110px", color: `${d.accentColor}0D`, lineHeight: 1 }}>{"\u265E"}</div>
      <div style={{ fontSize: "10px", color: `${d.accentColor}AA`, letterSpacing: "0.2em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: d.accentColor, letterSpacing: "0.06em", position: "relative" }}>{title}</div>
      <div style={{ width: "55px", height: "2px", backgroundColor: d.accentColor, position: "relative" }} />
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>Awarded to</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.accentColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "480px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 11: Black & Gold Elite - corner triangles with gold diagonals (Behance ref) ---------- */
function D11({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "20px 28px", overflow: "hidden" }}>
      {/* Four corner triangles */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, borderTop: `55px solid ${d.headerColor}`, borderRight: "55px solid transparent" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderTop: `55px solid ${d.headerColor}`, borderLeft: "55px solid transparent" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: 0, height: 0, borderBottom: `55px solid ${d.headerColor}`, borderRight: "55px solid transparent" }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 0, height: 0, borderBottom: `55px solid ${d.headerColor}`, borderLeft: "55px solid transparent" }} />
      {/* Gold accent diag lines */}
      <div style={{ position: "absolute", top: "5px", left: "5px", width: "42px", height: "1px", backgroundColor: d.accentColor, transform: "rotate(45deg)", transformOrigin: "top left" }} />
      <div style={{ position: "absolute", top: "5px", right: "5px", width: "42px", height: "1px", backgroundColor: d.accentColor, transform: "rotate(-45deg)", transformOrigin: "top right" }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}BB`, letterSpacing: "0.2em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ fontSize: "24px", color: `${d.accentColor}30`, position: "relative" }}>{"\u2766"}</div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>is proudly presented to</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.textColor, position: "relative", borderBottom: `2px solid ${d.accentColor}`, paddingBottom: "4px" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "480px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 12: Checkered Border - chess checkerboard on all 4 edges ---------- */
function D12({ d, body, p, title, event }: BodyProps) {
  const sq = 9
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "22px 28px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-conic-gradient(${d.headerColor} 0% 25%, transparent 0% 50%)`, backgroundSize: `${sq * 2}px ${sq * 2}px`, opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: `${sq * 2 + 2}px`, backgroundColor: d.bgColor, border: `2px solid ${d.accentColor}40` }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.accentColor, fontFamily: "Georgia, serif", position: "relative" }}>{title}</div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>This is to certify that</div>
      <div style={{ fontSize: "25px", fontWeight: 700, color: d.textColor, position: "relative", textDecoration: "underline", textDecorationColor: `${d.accentColor}50`, textUnderlineOffset: "4px" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "440px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ======== KIDS THEMES (13-16) - colorful, playful, very different layouts ======== */

/* ---------- 13: Pawn Stars (Kids) - scattered stars + bubbly colorful name bg ---------- */
function D13({ d, body, p, title, event }: BodyProps) {
  const stars = [
    { top: "8px", left: "20px", size: "18px", color: "#FFD700" },
    { top: "25px", right: "15px", size: "14px", color: "#FF6B6B" },
    { bottom: "20px", left: "30px", size: "12px", color: "#4ECDC4" },
    { bottom: "10px", right: "25px", size: "16px", color: "#A78BFA" },
    { top: "50%", left: "10px", size: "10px", color: "#F59E0B" },
    { top: "40%", right: "8px", size: "11px", color: "#EC4899" },
    { top: "10px", left: "45%", size: "9px", color: "#34D399" },
    { bottom: "35px", left: "50%", size: "13px", color: "#F97316" },
  ]
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px 24px", overflow: "hidden", background: `linear-gradient(135deg, ${d.bgColor}, ${d.accentColor}0A)` }}>
      {stars.map((st, i) => (
        <div key={i} style={{ position: "absolute", top: (st as any).top, bottom: (st as any).bottom, left: (st as any).left, right: (st as any).right, fontSize: st.size, color: st.color, opacity: 0.45 }}>{"\u2605"}</div>
      ))}
      <div style={{ fontSize: "10px", color: `${d.headerColor}CC`, letterSpacing: "0.12em", textTransform: "uppercase", position: "relative", fontWeight: 600 }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: d.accentColor, position: "relative", letterSpacing: "0.02em" }}>{"~ "}{title}{" ~"}</div>
      <div style={{ fontSize: "11px", color: `${d.textColor}90`, position: "relative" }}>{"Super Star Award for"}</div>
      <div style={{ fontSize: "26px", fontWeight: 800, color: d.headerColor, position: "relative", padding: "4px 20px", borderRadius: "10px", backgroundColor: `${d.accentColor}15`, border: `2px dashed ${d.accentColor}40` }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "480px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 14: Trophy Gold (Kids) - large trophy watermark + playful text ---------- */
function D14({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "12px 24px", overflow: "hidden" }}>
      {/* Trophy watermark */}
      <svg style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", opacity: 0.06 }} width="160" height="160" viewBox="0 0 24 24" fill={d.accentColor}><path d="M18 2c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1v3c0 1.66-1.34 3-3 3h-.17A5.991 5.991 0 0 1 13 16.92V19h4v2H7v-2h4v-2.08A5.991 5.991 0 0 1 5.17 12H5c-1.66 0-3-1.34-3-3V6c0-.55.45-1 1-1h2V3c0-.55.45-1 1-1h12ZM4 7v2c0 .55.45 1 1 1h.6A5.98 5.98 0 0 1 5 8.05V7H4Zm16 0h-1v1.05A5.98 5.98 0 0 1 18.4 10H19c.55 0 1-.45 1-1V7Z" /></svg>
      {/* Confetti-like dots */}
      {[{ t: "10px", l: "30px", c: "#FFD700" }, { t: "20px", r: "40px", c: "#FF6B6B" }, { b: "25px", l: "50px", c: "#4ECDC4" }, { b: "15px", r: "35px", c: "#A78BFA" }].map((dot, i) => (
        <div key={i} style={{ position: "absolute", top: (dot as any).t, bottom: (dot as any).b, left: (dot as any).l, right: (dot as any).r, width: "8px", height: "8px", borderRadius: "50%", backgroundColor: dot.c, opacity: 0.2 }} />
      ))}
      <div style={{ fontSize: "10px", color: `${d.headerColor}CC`, letterSpacing: "0.12em", textTransform: "uppercase", position: "relative", fontWeight: 600 }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: d.accentColor, position: "relative" }}>{"* "}{title}{" *"}</div>
      <div style={{ fontSize: "11px", color: `${d.textColor}90`, position: "relative" }}>{"This awesome certificate goes to"}</div>
      <div style={{ fontSize: "26px", fontWeight: 800, color: d.headerColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ width: "50px", height: "3px", borderRadius: "2px", backgroundColor: d.accentColor, position: "relative" }} />
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "480px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 15: Checkered Flag (Kids) - full checkerboard border + flag style ---------- */
function D15({ d, body, p, title, event }: BodyProps) {
  const sq = 8
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "22px 28px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-conic-gradient(${d.headerColor} 0% 25%, transparent 0% 50%)`, backgroundSize: `${sq * 2}px ${sq * 2}px`, opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: `${sq * 2 + 3}px`, backgroundColor: d.bgColor, border: `2px solid ${d.accentColor}40`, borderRadius: "6px" }} />
      {/* Small trophy icons in center */}
      <div style={{ fontSize: "20px", position: "relative", opacity: 0.15 }}>{"\uD83C\uDFC6"}</div>
      <div style={{ fontSize: "10px", color: `${d.headerColor}CC`, letterSpacing: "0.12em", textTransform: "uppercase", position: "relative", fontWeight: 600 }}>{event.tournamentName}</div>
      <div style={{ fontSize: "26px", fontWeight: 800, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>{"Young Champion Award for"}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: d.textColor, position: "relative", textDecoration: "underline", textDecorationColor: `${d.accentColor}50`, textUnderlineOffset: "4px" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "420px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 16: Knight Quest (Kids) - rainbow bar + dashed border + knight character ---------- */
function D16({ d, body, p, title, event }: BodyProps) {
  const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#A78BFA", "#FF9A8B"]
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "16px 24px", overflow: "hidden" }}>
      {/* Rainbow bar top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", display: "flex" }}>
        {colors.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
      </div>
      {/* Rainbow bar bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "6px", display: "flex" }}>
        {colors.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
      </div>
      {/* Dashed inner border */}
      <div style={{ position: "absolute", inset: "10px", border: `2px dashed ${d.accentColor}35`, borderRadius: "10px" }} />
      {/* Large knight character */}
      <div style={{ fontSize: "40px", position: "relative", opacity: 0.1 }}>{"\u265E"}</div>
      <div style={{ fontSize: "10px", color: `${d.headerColor}CC`, letterSpacing: "0.12em", textTransform: "uppercase", position: "relative", fontWeight: 600 }}>{event.tournamentName}</div>
      <div style={{ fontSize: "26px", fontWeight: 800, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>{"Rising Star Award for"}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: d.textColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "460px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 17: Indian Tricolor - saffron/white/green bars ---------- */
function D17({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "12px 24px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "5px", background: "linear-gradient(90deg, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "5px", background: "linear-gradient(90deg, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%)" }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", position: "relative" }}><div style={{ width: "45px", height: "1.5px", backgroundColor: "#FF9933" }} /><div style={{ width: "7px", height: "7px", borderRadius: "50%", border: "1.5px solid #138808" }} /><div style={{ width: "45px", height: "1.5px", backgroundColor: "#138808" }} /></div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>This certificate is presented to</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.textColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "500px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 18: Lions Club - gradient swirl + curved accent ---------- */
function D18({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "7px", padding: "12px 24px", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", background: `linear-gradient(180deg, ${d.accentColor}10, transparent)`, borderRadius: "0 0 200px 0" }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "28px", fontWeight: 700, color: d.accentColor, position: "relative" }}>{title}</div>
      <div style={{ width: "65px", height: "2px", backgroundColor: d.accentColor, position: "relative", borderRadius: "1px" }} />
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>Presented to</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.textColor, position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "500px", lineHeight: 1.7, position: "relative" }}>{body}</div>
    </div>
  )
}

/* ---------- 19: Federation Style - RIGHT accent strip with rank number ---------- */
function D19({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px 16px" }}>
        <div style={{ fontSize: "9px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase" }}>{event.tournamentName}</div>
        <div style={{ fontSize: "26px", fontWeight: 800, color: d.accentColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
        <div style={{ fontSize: "10px", color: `${d.textColor}80` }}>Awarded to</div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: d.textColor }}>{p.title} {p.name}</div>
        <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "420px", lineHeight: 1.7 }}>{body}</div>
      </div>
      <div style={{ width: "75px", backgroundColor: d.accentColor, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ fontSize: "36px", fontWeight: 900, color: "#fff" }}>{p.position ? `#${parseInt(p.position) || p.position}` : ""}</div>
        <div style={{ fontSize: "7px", color: "#ffffffB0", textTransform: "uppercase", letterSpacing: "0.1em" }}>Rank</div>
      </div>
    </div>
  )
}

/* ---------- 20: Association Classic - ornate triple border frame + filigree ---------- */
function D20({ d, body, p, title, event }: BodyProps) {
  return (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", padding: "20px 28px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: "5px", border: `2.5px solid ${d.accentColor}`, borderRadius: "2px" }} />
      <div style={{ position: "absolute", inset: "10px", border: `1px solid ${d.accentColor}50` }} />
      <div style={{ position: "absolute", inset: "14px", border: `0.5px solid ${d.accentColor}25` }} />
      <div style={{ fontSize: "10px", color: `${d.headerColor}BB`, letterSpacing: "0.15em", textTransform: "uppercase", position: "relative" }}>{event.tournamentName}</div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: d.accentColor, fontFamily: "Georgia, serif", fontStyle: "italic", position: "relative" }}>{title}</div>
      <div style={{ fontSize: "18px", color: `${d.accentColor}35`, position: "relative" }}>{"\u2767 \u2619 \u2767"}</div>
      <div style={{ fontSize: "10px", color: `${d.textColor}80`, position: "relative" }}>This certificate is awarded to</div>
      <div style={{ fontSize: "25px", fontWeight: 700, color: d.textColor, fontFamily: "Georgia, serif", position: "relative" }}>{p.title} {p.name}</div>
      <div style={{ fontSize: "10.5px", color: `${d.textColor}CC`, textAlign: "center", maxWidth: "460px", lineHeight: 1.7, position: "relative" }}>{body}</div>
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
  const d = customColors ? { ...design, accentColor: customColors.accentColor || design.accentColor, headerColor: customColors.headerColor || design.headerColor, bgColor: customColors.bgColor || design.bgColor, textColor: customColors.textColor || design.textColor, borderColor: customColors.borderColor || design.borderColor } : design
  const body = resolveWording(wordingTemplate, participant, event)
  const title = "Certificate of " + (parseInt(participant.position) <= 3 ? "Merit" : "Participation")

  const BodyComponent = BODY_MAP[designId] || D1

  return (
    <div style={{ width: `${Math.round(W * scale)}px`, height: `${Math.round(H * scale)}px`, overflow: "hidden" }}>
      <div data-certificate style={{
        width: `${W}px`, height: `${H}px`,
        backgroundColor: d.bgColor,
        border: `2px solid ${d.borderColor}`,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
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
    const origTransformOrigin = certEl.style.transformOrigin
    certEl.style.transform = "none"
    certEl.style.transformOrigin = ""

    const { default: html2canvas } = await import("html2canvas")
    const { default: jsPDF } = await import("jspdf")
    const canvas = await html2canvas(certEl, { scale: 3, useCORS: true, backgroundColor: null })

    certEl.style.transform = origTransform
    certEl.style.transformOrigin = origTransformOrigin

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] })
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
    pdf.save(`${filename}.pdf`)
    return true
  } catch (e) { console.error("PDF download failed:", e); return false }
}

/* ============================================================
   THUMBNAIL for Design Picker
   ============================================================ */
export function CertificateThumbnail({ designId, colors, isSelected, onClick }: { designId: number; colors?: Record<string, string>; isSelected?: boolean; onClick?: () => void }) {
  const design = CERTIFICATE_DESIGNS.find(d => d.id === designId) || CERTIFICATE_DESIGNS[0]
  const d = colors ? { ...design, accentColor: colors.accentColor || design.accentColor, bgColor: colors.bgColor || design.bgColor, headerColor: colors.headerColor || design.headerColor } : design
  return (
    <button onClick={onClick} style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{
        width: 130, height: 92, backgroundColor: d.bgColor, border: isSelected ? `2.5px solid ${d.accentColor}` : `1.5px solid ${d.borderColor}50`, borderRadius: 6, overflow: "hidden", display: "flex", flexDirection: "column", fontSize: 5, position: "relative",
        boxShadow: isSelected ? `0 0 0 2px ${d.accentColor}30` : "0 1px 3px rgba(0,0,0,0.08)", transition: "all 0.15s",
      }}>
        {/* Mini header: logo placeholders */}
        <div style={{ display: "flex", alignItems: "center", padding: "3px 6px", gap: 3, minHeight: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: `${d.accentColor}30` }} />
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 2 }}>
            <div style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: `${d.accentColor}15` }} />
            <div style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: `${d.accentColor}15` }} />
          </div>
        </div>
        {/* Mini body - unique per category */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: "0 8px", position: "relative", overflow: "hidden" }}>
          {design.category === "playful" && (
            <>
              <div style={{ position: "absolute", top: 2, left: 6, fontSize: 6, opacity: 0.3 }}>{"\u2605"}</div>
              <div style={{ position: "absolute", bottom: 3, right: 8, fontSize: 5, opacity: 0.3, color: "#FF6B6B" }}>{"\u2605"}</div>
            </>
          )}
          {design.category === "premium" && designId === 10 && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: d.bgColor }} />
          )}
          <div style={{ width: 40, height: 2.5, backgroundColor: `${d.textColor}20`, borderRadius: 1, position: "relative" }} />
          <div style={{ width: 55, height: 4, backgroundColor: `${d.accentColor}50`, borderRadius: 1, position: "relative" }} />
          <div style={{ width: 35, height: 2, backgroundColor: `${d.textColor}20`, borderRadius: 1, position: "relative" }} />
          <div style={{ width: 48, height: 5, backgroundColor: `${d.textColor}35`, borderRadius: 1, position: "relative" }} />
          <div style={{ width: 65, height: 2, backgroundColor: `${d.textColor}12`, borderRadius: 1, position: "relative" }} />
        </div>
        {/* Mini footer */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "3px 8px", minHeight: 10 }}>
          <div style={{ width: 16, height: 1.5, backgroundColor: `${d.textColor}20`, borderRadius: 1 }} />
          <div style={{ width: 16, height: 1.5, backgroundColor: `${d.textColor}20`, borderRadius: 1 }} />
        </div>
      </div>
      <span style={{ fontSize: "10px", color: isSelected ? d.accentColor : "#666", fontWeight: isSelected ? 600 : 400, textAlign: "center", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{design.name}</span>
    </button>
  )
}
