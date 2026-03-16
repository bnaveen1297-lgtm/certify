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
  if (idx >= 0) {
    all[idx] = tpl
  } else {
    all.unshift(tpl)
  }
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

// ─── Extended element factories ─────────────────────────────────────────────

/** Double-line border frame (two concentric rectangles) — adds 2 elements */
export function defaultBorderFrame(): [ShapeElement, ShapeElement] {
  return [
    defaultRectangle({ x: 10, y: 10, width: 780, height: 546, stroke: "#b8860b", strokeWidth: 3, zIndex: 1 }),
    defaultRectangle({ x: 18, y: 18, width: 764, height: 530, stroke: "#b8860b80", strokeWidth: 1, zIndex: 2 }),
  ]
}

/** Decorative corner badge (filled rectangle, top-left) */
export function defaultBadge(overrides: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: genId(), type: "rectangle",
    x: 30, y: 240, width: 120, height: 36,
    rotation: 0, opacity: 100, locked: false, visible: true, zIndex: 8,
    fill: "#b8860b", stroke: "transparent", strokeWidth: 0, borderRadius: 4,
    ...overrides,
  }
}

/** Star shape as a text element using unicode ★ */
export function defaultStar(overrides: Partial<TextElement> = {}): TextElement {
  return defaultTextElement({
    content: "★", fontSize: 40, color: "#d4af37",
    x: 370, y: 60, width: 60, height: 60,
    fontFamily: "system-ui, sans-serif",
    ...overrides,
  })
}

/** Trophy icon (unicode) */
export function defaultTrophy(overrides: Partial<TextElement> = {}): TextElement {
  return defaultTextElement({
    content: "🏆", fontSize: 48, color: "#d4af37",
    x: 360, y: 50, width: 80, height: 72,
    fontFamily: "system-ui, sans-serif",
    ...overrides,
  })
}

/** Medal ribbon element (text-based) */
export function defaultMedal(overrides: Partial<TextElement> = {}): TextElement {
  return defaultTextElement({
    content: "🥇", fontSize: 48,
    x: 360, y: 50, width: 80, height: 72,
    fontFamily: "system-ui, sans-serif",
    ...overrides,
  })
}

/** Kids star burst (text emoji) */
export function defaultStarBurst(overrides: Partial<TextElement> = {}): TextElement {
  return defaultTextElement({
    content: "🌟", fontSize: 36,
    x: 40, y: 40, width: 60, height: 54,
    fontFamily: "system-ui, sans-serif",
    ...overrides,
  })
}

/** Checkered border strip (decorative rectangle row) */
export function defaultStripe(color = "#d4af37", overrides: Partial<ShapeElement> = {}): ShapeElement {
  return defaultRectangle({
    x: 0, y: 0, width: 800, height: 12,
    fill: color, stroke: "transparent", strokeWidth: 0,
    zIndex: 3, ...overrides,
  })
}

// ─── Border presets (many styles) ──────────────────────────────────────────

/** Single thin border */
export function borderSingle(color = "#b8860b"): ShapeElement[] {
  return [defaultRectangle({ x: 10, y: 10, width: 780, height: 546, stroke: color, strokeWidth: 1.5, fill: "transparent", zIndex: 1 })]
}

/** Double-line border */
export function borderDouble(color = "#b8860b"): ShapeElement[] {
  return [
    defaultRectangle({ x: 8, y: 8, width: 784, height: 550, stroke: color, strokeWidth: 3, fill: "transparent", zIndex: 1 }),
    defaultRectangle({ x: 16, y: 16, width: 768, height: 534, stroke: color, strokeWidth: 1, fill: "transparent", zIndex: 2 }),
  ]
}

/** Triple-line border */
export function borderTriple(color = "#b8860b"): ShapeElement[] {
  return [
    defaultRectangle({ x: 6, y: 6, width: 788, height: 554, stroke: color, strokeWidth: 4, fill: "transparent", zIndex: 1 }),
    defaultRectangle({ x: 14, y: 14, width: 772, height: 538, stroke: color, strokeWidth: 1, fill: "transparent", zIndex: 2 }),
    defaultRectangle({ x: 20, y: 20, width: 760, height: 526, stroke: color, strokeWidth: 1, fill: "transparent", zIndex: 3 }),
  ]
}

/** Dashed border */
export function borderDashed(color = "#b8860b"): DividerElement[] {
  // Use 4 dividers to approximate a dashed border frame
  return [
    { id: genId(), type: "divider", x: 10, y: 10, width: 780, height: 4, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: 2, stroke: color, strokeWidth: 2, style: "dashed" },
    { id: genId(), type: "divider", x: 10, y: 552, width: 780, height: 4, rotation: 0, opacity: 100, locked: false, visible: true, zIndex: 2, stroke: color, strokeWidth: 2, style: "dashed" },
    { id: genId(), type: "divider", x: 10, y: 10, width: 4, height: 542, rotation: 90, opacity: 100, locked: false, visible: true, zIndex: 2, stroke: color, strokeWidth: 2, style: "dashed" },
    { id: genId(), type: "divider", x: 786, y: 10, width: 4, height: 542, rotation: 90, opacity: 100, locked: false, visible: true, zIndex: 2, stroke: color, strokeWidth: 2, style: "dashed" },
  ]
}

/** Thick colored solid border */
export function borderThick(color = "#1e3a5f"): ShapeElement[] {
  return [defaultRectangle({ x: 0, y: 0, width: 800, height: 566, stroke: color, strokeWidth: 14, fill: "transparent", zIndex: 1 })]
}

/** Top + bottom stripe bars (institutional style) */
export function borderStripes(color = "#d4af37"): ShapeElement[] {
  return [
    defaultRectangle({ x: 0, y: 0, width: 800, height: 18, fill: color, stroke: "transparent", strokeWidth: 0, borderRadius: 0, zIndex: 2 }),
    defaultRectangle({ x: 0, y: 548, width: 800, height: 18, fill: color, stroke: "transparent", strokeWidth: 0, borderRadius: 0, zIndex: 2 }),
  ]
}

/** Four corner accent squares */
export function borderCornerSquares(color = "#b8860b"): ShapeElement[] {
  const sq = (x: number, y: number): ShapeElement => defaultRectangle({ x, y, width: 24, height: 24, fill: color, stroke: "transparent", strokeWidth: 0, borderRadius: 2, zIndex: 4 })
  return [sq(8, 8), sq(768, 8), sq(8, 534), sq(768, 534)]
}

/** Corner L-brackets */
export function borderCornerBrackets(color = "#b8860b"): ShapeElement[] {
  const hBar = (x: number, y: number): ShapeElement => defaultRectangle({ x, y, width: 50, height: 4, fill: color, stroke: "transparent", strokeWidth: 0, borderRadius: 0, zIndex: 4 })
  const vBar = (x: number, y: number): ShapeElement => defaultRectangle({ x, y, width: 4, height: 50, fill: color, stroke: "transparent", strokeWidth: 0, borderRadius: 0, zIndex: 4 })
  return [
    hBar(8, 8), vBar(8, 8),             // top-left
    hBar(742, 8), vBar(788, 8),          // top-right
    hBar(8, 554), vBar(8, 508),          // bottom-left
    hBar(742, 554), vBar(788, 508),      // bottom-right
  ]
}

/** Rounded shadow box */
export function borderRounded(color = "#4f46e5"): ShapeElement[] {
  return [defaultRectangle({ x: 12, y: 12, width: 776, height: 542, stroke: color, strokeWidth: 2, fill: "transparent", borderRadius: 16, zIndex: 1 })]
}

/** Full colored filled border panel (left strip) */
export function borderLeftAccent(color = "#1e3a5f"): ShapeElement[] {
  return [defaultRectangle({ x: 0, y: 0, width: 12, height: 566, fill: color, stroke: "transparent", strokeWidth: 0, borderRadius: 0, zIndex: 2 })]
}

/** Double outer + thick inner */
export function borderOrnate(color = "#8b0000"): ShapeElement[] {
  return [
    defaultRectangle({ x: 4, y: 4, width: 792, height: 558, stroke: color, strokeWidth: 5, fill: "transparent", zIndex: 1 }),
    defaultRectangle({ x: 14, y: 14, width: 772, height: 538, stroke: color, strokeWidth: 1, fill: "transparent", zIndex: 2 }),
    defaultRectangle({ x: 20, y: 20, width: 760, height: 526, stroke: color + "60", strokeWidth: 1, fill: "transparent", zIndex: 3 }),
  ]
}

// Border preset registry for the elements panel
export const BORDER_PRESETS: { label: string; make: () => TemplateElement[] }[] = [
  { label: "Single", make: () => borderSingle() },
  { label: "Double", make: () => borderDouble() },
  { label: "Triple", make: () => borderTriple() },
  { label: "Dashed", make: () => borderDashed() },
  { label: "Thick", make: () => borderThick() },
  { label: "Stripes", make: () => borderStripes() },
  { label: "Corners", make: () => borderCornerSquares() },
  { label: "Brackets", make: () => borderCornerBrackets() },
  { label: "Rounded", make: () => borderRounded() },
  { label: "Left Bar", make: () => borderLeftAccent() },
  { label: "Ornate", make: () => borderOrnate() },
  { label: "Frame", make: () => defaultBorderFrame() },
]


export function defaultRibbonLabel(text = "WINNER"): [ShapeElement, TextElement] {
  const id = genId()
  return [
    defaultRectangle({ x: 0, y: 200, width: 160, height: 36, fill: "#b8860b", stroke: "transparent", strokeWidth: 0, borderRadius: 0, zIndex: 6 }),
    defaultTextElement({ content: text, x: 0, y: 200, width: 160, height: 36, fontSize: 13, fontWeight: "700", color: "#ffffff", textAlign: "center", zIndex: 7 }),
  ]
}
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
