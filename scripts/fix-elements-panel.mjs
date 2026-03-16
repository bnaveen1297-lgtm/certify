import { writeFileSync } from "fs"
import { join } from "path"

const content = `"use client"

import { useRef, useState } from "react"
import {
  CertificateTemplate, TemplateElement,
  defaultTextElement, defaultHeadingElement, defaultDivider,
  defaultRectangle, defaultEllipse, defaultLogoElement,
  defaultStar, defaultTrophy, defaultMedal, defaultStarBurst,
  defaultBadge, defaultStripe, defaultRibbonLabel,
  BORDER_PRESETS, TEXT_TOKENS,
} from "@/lib/template-editor"
import {
  Type, Minus, Square, Circle, Image as ImageIcon, Star, Trophy,
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, GripVertical,
  ChevronDown, ChevronRight,
} from "lucide-react"

interface ElementsPanelProps {
  template: CertificateTemplate
  selectedId: string | null
  onSelectElement: (id: string) => void
  onAddElement: (el: TemplateElement | TemplateElement[]) => void
  onRemoveElement: (id: string) => void
  onDuplicateElement: (id: string) => void
  onReorderElements: (els: TemplateElement[]) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
}

const ADD_ITEMS: { label: string; icon: React.ReactNode; make: () => TemplateElement | TemplateElement[] }[] = [
  { label: "Heading", icon: <span className="font-black text-[11px]">H</span>, make: () => defaultHeadingElement() },
  { label: "Text", icon: <Type size={13} />, make: () => defaultTextElement({ content: "Click to edit text" }) },
  { label: "Token", icon: <span className="text-[9px] font-bold font-mono">{"{T}"}</span>, make: () => defaultTextElement({ content: "{FullName}", fontSize: 22, fontWeight: "700" }) },
  { label: "Divider", icon: <Minus size={13} />, make: () => defaultDivider() },
  { label: "Rect", icon: <Square size={12} />, make: () => defaultRectangle({ x: 60, y: 60, width: 200, height: 120, fill: "transparent" }) },
  { label: "Circle", icon: <Circle size={12} />, make: () => defaultEllipse() },
  { label: "Org Logo", icon: <ImageIcon size={12} />, make: () => defaultLogoElement("logo_organizer") },
  { label: "Sponsor", icon: <ImageIcon size={12} />, make: () => defaultLogoElement("logo_sponsor") },
  { label: "Badge", icon: <Square size={12} />, make: () => defaultBadge() },
  { label: "Stripe", icon: <Minus size={12} />, make: () => defaultStripe() },
  { label: "Ribbon", icon: <span className="text-[9px] font-bold">RBN</span>, make: () => defaultRibbonLabel() },
  { label: "Star", icon: <Star size={12} />, make: () => defaultStar() },
  { label: "Trophy", icon: <Trophy size={12} />, make: () => defaultTrophy() },
  { label: "Medal", icon: <span className="text-[11px]">\u{1F947}</span>, make: () => defaultMedal() },
  { label: "Sparkle", icon: <span className="text-[11px]">\u{1F31F}</span>, make: () => defaultStarBurst() },
]

function elIcon(type: string) {
  switch (type) {
    case "heading": return <span className="font-black text-[9px] text-white/50">H</span>
    case "text": return <Type size={10} className="text-white/40" />
    case "divider": return <Minus size={10} className="text-white/40" />
    case "rectangle": return <Square size={10} className="text-white/40" />
    case "ellipse": return <Circle size={10} className="text-white/40" />
    case "logo_organizer": case "logo_sponsor": return <ImageIcon size={10} className="text-white/40" />
    default: return <Square size={10} className="text-white/40" />
  }
}

function elLabel(el: TemplateElement): string {
  if (el.type === "text" || el.type === "heading") {
    const content = (el as any).content as string
    const clean = content.replace(/\\{|\\}/g, "")
    return clean.length > 24 ? clean.slice(0, 24) + "\\u2026" : clean
  }
  const map: Record<string, string> = {
    divider: "Divider", rectangle: "Rectangle", ellipse: "Ellipse",
    logo_organizer: "Organizer Logo", logo_sponsor: "Sponsor Logo", image: "Image",
  }
  return map[el.type] ?? el.type
}

export function ElementsPanel({
  template, selectedId,
  onSelectElement, onAddElement, onRemoveElement, onDuplicateElement,
  onReorderElements, onToggleVisibility, onToggleLock,
}: ElementsPanelProps) {
  const sorted = [...template.elements].sort((a, b) => b.zIndex - a.zIndex)
  const [bordersOpen, setBordersOpen] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOver = useRef<number | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  function handleDragStart(idx: number) { dragItem.current = idx; setDragIdx(idx) }
  function handleDragEnter(idx: number) { dragOver.current = idx; setOverIdx(idx) }
  function handleDragEnd() {
    const from = dragItem.current
    const to = dragOver.current
    setDragIdx(null); setOverIdx(null)
    dragItem.current = null; dragOver.current = null
    if (from === null || to === null || from === to) return
    const reordered = [...sorted]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    const maxZ = reordered.length
    const updated = reordered.map((el, i) => ({ ...el, zIndex: maxZ - i }))
    onReorderElements(updated)
  }

  return (
    <div className="flex flex-col">
      <div className="p-3 border-b border-white/10">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2.5">Elements</p>
        <div className="grid grid-cols-4 gap-1.5">
          {ADD_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => onAddElement(item.make() as TemplateElement | TemplateElement[])}
              title={item.label}
              className="flex flex-col items-center justify-center gap-1 rounded-lg py-2.5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/25 transition-colors text-[10px] leading-tight"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-white/10">
        <button
          onClick={() => setBordersOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-semibold text-white/40 uppercase tracking-widest hover:text-white/60 transition-colors"
        >
          <span>Borders &amp; Frames</span>
          {bordersOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        {bordersOpen && (
          <div className="px-3 pb-3 grid grid-cols-4 gap-1.5">
            {BORDER_PRESETS.map(bp => (
              <button
                key={bp.label}
                onClick={() => onAddElement(bp.make())}
                title={bp.label}
                className="flex flex-col items-center justify-center gap-1 rounded-lg py-2.5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-[#d4af37]/40 transition-colors text-[10px] leading-tight"
              >
                <Square size={11} className="text-[#d4af37]/60" />
                <span>{bp.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-b border-white/10">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Insert Token</p>
        <div className="flex flex-wrap gap-1">
          {TEXT_TOKENS.map(t => (
            <button
              key={t.token}
              title={t.label}
              onClick={() => onAddElement(defaultTextElement({ content: t.token, fontSize: 14, color: "#475569" }) as TemplateElement)}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-[#d4af37]/30 text-[#d4af37]/80 hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors"
            >
              {t.token}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
          Layers <span className="font-normal text-white/20">({template.elements.length})</span>
        </p>
        {template.elements.length === 0 && (
          <p className="text-[11px] text-white/20 text-center py-4">No elements yet. Add some above.</p>
        )}
        <div className="space-y-0.5">
          {sorted.map((el, idx) => {
            const isSelected = selectedId === el.id
            const isDragging = dragIdx === idx
            const isOver = overIdx === idx && dragIdx !== null && dragIdx !== idx
            return (
              <div
                key={el.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
                onClick={() => onSelectElement(el.id)}
                className={\`group flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer select-none transition-all \${
                  isSelected ? "bg-[#3b82f6]/15 border border-[#3b82f6]/40" : "hover:bg-white/5 border border-transparent"
                } \${isDragging ? "opacity-40" : "opacity-100"} \${isOver ? "border-t-2 border-t-[#3b82f6]" : ""}\`}
              >
                <span className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing shrink-0">
                  <GripVertical size={12} />
                </span>
                <span className="shrink-0 w-3.5 flex items-center justify-center">{elIcon(el.type)}</span>
                <span className={\`flex-1 text-[11px] truncate \${el.visible ? "text-white/70" : "text-white/25 line-through"}\`}>
                  {elLabel(el)}
                </span>
                <div className={\`flex items-center gap-0.5 \${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity\`}>
                  <button
                    onClick={e => { e.stopPropagation(); onToggleVisibility(el.id) }}
                    className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white rounded"
                  >
                    {el.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onToggleLock(el.id) }}
                    className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white rounded"
                  >
                    {el.locked ? <Lock size={10} /> : <Unlock size={10} />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDuplicateElement(el.id) }}
                    className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white rounded"
                  >
                    <Copy size={10} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onRemoveElement(el.id) }}
                    className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-red-400 rounded"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
`

const dest = join(process.cwd(), "components/editor/elements-panel.tsx")
writeFileSync(dest, content, "utf8")
console.log("[v0] Written", dest, "lines:", content.split("\\n").length)
