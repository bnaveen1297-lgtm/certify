// ─── Template Editor Data Model ────────────────────────────────────────────

export type ElementType =
  | "text"
  | "heading"
  | "divider"
  | "rectangle"
  | "ellipse"
  | "logo_organizer"
  | "logo_sponsor"
  | "image"

export interface BaseElement {
  id: string
  type: ElementType
  x: number       // left offset in px (0–800)
  y: number       // top offset in px (0–566)
  width: number
  height: number
  rotation: number // degrees
  opacity: number  // 0–100
  locked: boolean
  visible: boolean
  zIndex: number
}

export interface TextElement extends BaseElement {
  type: "text" | "heading"
  content: string          // may contain tokens like {Name}, {TournamentName}
  fontFamily: string
  fontSize: number         // px
  fontWeight: "normal" | "bold" | "600" | "700" | "800" | "900"
  fontStyle: "normal" | "italic"
  color: string
  textAlign: "left" | "center" | "right"
  letterSpacing: number    // em
  lineHeight: number
  textDecoration: "none" | "underline"
  backgroundColor: string  // "transparent" or hex
  borderRadius: number
  padding: number
}

export interface ShapeElement extends BaseElement {
  type: "rectangle" | "ellipse"
  fill: string
  stroke: string
  strokeWidth: number
  borderRadius: number     // only for rectangle
}

export interface DividerElement extends BaseElement {
  type: "divider"
  stroke: string
  strokeWidth: number
  style: "solid" | "dashed" | "dotted" | "double"
}

export interface LogoElement extends BaseElement {
  type: "logo_organizer" | "logo_sponsor"
  src: string | null       // base64 or url; null = placeholder
  objectFit: "contain" | "cover"
  label: string
}

export interface ImageElement extends BaseElement {
  type: "image"
  src: string
  objectFit: "contain" | "cover"
  borderRadius: number
}

export type TemplateElement =
  | TextElement
  | ShapeElement
  | DividerElement
  | LogoElement
  | ImageElement

export interface CanvasBackground {
  type: "solid" | "gradient" | "image"
  color: string            // for solid
  gradient?: string        // CSS gradient string
  imageSrc?: string        // base64 for image bg
  borderColor: string
  borderWidth: number
}

export interface CertificateTemplate {
  id: string
  name: string
  description: string
  baseDesignId: number | null   // which preset it was derived from (null = scratch)
  background: CanvasBackground
  elements: TemplateElement[]
  createdAt: string
  updatedAt: string
  isCustom: true
}

// ─── Canvas dimensions ──────────────────────────────────────────────────────
export const CANVAS_W = 800
export const CANVAS_H = 566

// ─── Token list for text elements ───────────────────────────────────────────
export const TEXT_TOKENS = [
  { token: "{Name}", label: "Participant Name" },
  { token: "{Title}", label: "Title (Mr./Ms./Master)" },
  { token: "{FullName}", label: "Full Name (Title + Name)" },
  { token: "{Position}", label: "Position / Rank" },
  { token: "{Category}", label: "Category / Segment" },
  { token: "{Points}", label: "Points Scored" },
  { token: "{TournamentName}", label: "Tournament Name" },
  { token: "{Venue}", label: "Venue" },
  { token: "{StartDate}", label: "Start Date" },
  { token: "{EndDate}", label: "End Date" },
  { token: "{Rounds}", label: "Total Rounds" },
]

// ─── Preset font families ────────────────────────────────────────────────────
export const FONT_FAMILIES = [
  "Georgia, serif",
  "Times New Roman, serif",
  "Palatino, serif",
  "Garamond, serif",
  "Baskerville, serif",
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Verdana, sans-serif",
  "Trebuchet MS, sans-serif",
  "system-ui, sans-serif",
  "Courier New, monospace",
]

// ─── Generate unique ID ──────────────────────────────────────────────────────
export function genId(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ─── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = "certify_custom_templates"

export function loadTemplates(): CertificateTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CertificateTemplate[]
  } catch {
    return []
  }
}

export function saveTemplates(templates: CertificateTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  } catch {
    // quota exceeded — try without image backgrounds
    try {
      const stripped = templates.map(t => ({
        ...t,
        background: { ...t.background, imageSrc: undefined },
        elements: t.elements.map(el =>
          el.type === "logo_organizer" || el.type === "logo_sponsor" || el.type === "image"
            ? { ...el, src: null }
            : el
        ),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped))
    } catch { /* truly full */ }
  }
}

export function upsertTemplate(tpl: CertificateTemplate): void {
  const all = loadTemplates()
  const idx = all.findIndex(t => t.id === tpl.id)
  if (idx >= 0) all[idx] = tpl
  else all.unshift(tpl)
  saveTemplates(all)
}

export function deleteTemplate(id: string): void {
  saveTemplates(loadTemplates().filter(t => t.id !== id))
}

// ─── Default elements factory ────────────────────────────────────────────────
export function defaultTextElement(overrides: Partial<TextElement> = {}): TextElement {
  return {
    id: genId(),
    type: "text",
    x: 80, y: 260,
    width: 640, height: 40,
    rotation: 0, opacity: 100,
    locked: false, visible: true,
    zIndex: 10,
    content: "Click to edit text",
    fontFamily: "Georgia, serif",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    color: "#1e293b",
    textAlign: "center",
    letterSpacing: 0,
    lineHeight: 1.5,
    textDecoration: "none",
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 4,
    ...overrides,
  }
}

export function defaultHeadingElement(overrides: Partial<TextElement> = {}): TextElement {
  return defaultTextElement({
    type: "heading",
    content: "Certificate of Achievement",
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    color: "#b8860b",
    y: 140,
    height: 50,
    ...overrides,
  })
}

export function defaultDivider(overrides: Partial<DividerElement> = {}): DividerElement {
  return {
    id: genId(),
    type: "divider",
    x: 160, y: 283,
    width: 480, height: 4,
    rotation: 0, opacity: 100,
    locked: false, visible: true,
    zIndex: 5,
    stroke: "#b8860b",
    strokeWidth: 2,
    style: "solid",
    ...overrides,
  }
}

export function defaultRectangle(overrides: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: genId(),
    type: "rectangle",
    x: 20, y: 20,
    width: 760, height: 526,
    rotation: 0, opacity: 100,
    locked: false, visible: true,
    zIndex: 1,
    fill: "transparent",
    stroke: "#b8860b",
    strokeWidth: 2,
    borderRadius: 0,
    ...overrides,
  }
}

export function defaultEllipse(overrides: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: genId(),
    type: "ellipse",
    x: 340, y: 220,
    width: 120, height: 120,
    rotation: 0, opacity: 100,
    locked: false, visible: true,
    zIndex: 5,
    fill: "#b8860b20",
    stroke: "#b8860b",
    strokeWidth: 1,
    borderRadius: 0,
    ...overrides,
  }
}

export function defaultLogoElement(type: "logo_organizer" | "logo_sponsor"): LogoElement {
  return {
    id: genId(),
    type,
    x: type === "logo_organizer" ? 30 : 660,
    y: 20,
    width: 80,
    height: 60,
    rotation: 0, opacity: 100,
    locked: false, visible: true,
    zIndex: 8,
    src: null,
    objectFit: "contain",
    label: type === "logo_organizer" ? "Organizer Logo" : "Sponsor Logo",
  }
}

// ─── Blank canvas template ───────────────────────────────────────────────────
export function blankTemplate(): CertificateTemplate {
  const now = new Date().toISOString()
  return {
    id: genId(),
    name: "Untitled Template",
    description: "",
    baseDesignId: null,
    background: {
      type: "solid",
      color: "#fffef7",
      borderColor: "#b8860b",
      borderWidth: 2,
    },
    elements: [
      defaultRectangle({ x: 14, y: 14, width: 772, height: 538, stroke: "#b8860b60", strokeWidth: 1.5, zIndex: 1 }),
      defaultLogoElement("logo_organizer"),
      defaultLogoElement("logo_sponsor"),
      defaultHeadingElement(),
      defaultDivider(),
      defaultTextElement({ content: "This is proudly presented to", y: 200, fontSize: 11, color: "#64748b", fontStyle: "italic" }),
      defaultTextElement({ content: "{FullName}", y: 230, fontSize: 26, fontWeight: "700", color: "#1e293b" }),
      defaultTextElement({ content: "{TournamentName}", y: 300, fontSize: 13, color: "#475569", fontWeight: "600" }),
      defaultTextElement({ content: "{Venue}  |  {StartDate} – {EndDate}", y: 325, fontSize: 10, color: "#94a3b8" }),
    ],
    createdAt: now,
    updatedAt: now,
    isCustom: true,
  }
}
