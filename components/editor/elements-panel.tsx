"use client"

import {
  CertificateTemplate, TemplateElement,
  defaultTextElement, defaultHeadingElement, defaultDivider,
  defaultRectangle, defaultEllipse, defaultLogoElement,
  TEXT_TOKENS,
} from "@/lib/template-editor"
import {
  Type, Minus, Square, Circle, Image as ImageIcon,
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronUp, ChevronDown,
} from "lucide-react"

interface ElementsPanelProps {
  template: CertificateTemplate
  selectedId: string | null
  onSelectElement: (id: string) => void
  onAddElement: (el: TemplateElement) => void
  onRemoveElement: (id: string) => void
  onDuplicateElement: (id: string) => void
  onReorderElements: (els: TemplateElement[]) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
}

const ADD_ITEMS = [
  { label: "Heading", icon: <span style={{ fontWeight: 800, fontSize: 12 }}>H</span>, make: () => defaultHeadingElement() },
  { label: "Body Text", icon: <Type size={13} />, make: () => defaultTextElement({ content: "Click to edit text" }) },
  { label: "Token Text", icon: <span style={{ fontSize: 9, fontWeight: 700 }}>{"{T}"}</span>, make: () => defaultTextElement({ content: "{FullName}", fontSize: 22, fontWeight: "700" }) },
  { label: "Divider", icon: <Minus size={13} />, make: () => defaultDivider() },
  { label: "Rectangle", icon: <Square size={12} />, make: () => defaultRectangle({ x: 60, y: 60, width: 200, height: 120, fill: "transparent" }) },
  { label: "Ellipse", icon: <Circle size={12} />, make: () => defaultEllipse() },
  { label: "Org Logo", icon: <ImageIcon size={12} />, make: () => defaultLogoElement("logo_organizer") },
  { label: "Sponsor Logo", icon: <ImageIcon size={12} />, make: () => defaultLogoElement("logo_sponsor") },
]

function elIcon(type: string) {
  switch (type) {
    case "heading": return <span style={{ fontWeight: 800, fontSize: 10 }}>H</span>
    case "text": return <Type size={10} />
    case "divider": return <Minus size={10} />
    case "rectangle": return <Square size={10} />
    case "ellipse": return <Circle size={10} />
    case "logo_organizer": case "logo_sponsor": return <ImageIcon size={10} />
    default: return <Square size={10} />
  }
}

function elLabel(el: TemplateElement): string {
  if (el.type === "text" || el.type === "heading") {
    const content = (el as any).content as string
    return content.length > 22 ? content.slice(0, 22) + "…" : content
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

  const move = (id: string, dir: "up" | "down") => {
    const els = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)
    const idx = els.findIndex(e => e.id === id)
    if (dir === "up" && idx < els.length - 1) {
      const next = idx + 1
      const tmp = els[idx].zIndex
      els[idx] = { ...els[idx], zIndex: els[next].zIndex }
      els[next] = { ...els[next], zIndex: tmp }
    } else if (dir === "down" && idx > 0) {
      const prev = idx - 1
      const tmp = els[idx].zIndex
      els[idx] = { ...els[idx], zIndex: els[prev].zIndex }
      els[prev] = { ...els[prev], zIndex: tmp }
    }
    onReorderElements(els)
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Add buttons */}
      <div className="p-3 border-b border-white/10">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Add Element</p>
        <div className="grid grid-cols-4 gap-1.5">
          {ADD_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => onAddElement(item.make() as TemplateElement)}
              title={item.label}
              className="flex flex-col items-center justify-center gap-1 rounded-lg py-2 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/25 transition-colors text-[10px]"
            >
              {item.icon}
              <span className="leading-none text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tokens */}
      <div className="p-3 border-b border-white/10">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Dynamic Tokens</p>
        <div className="flex flex-wrap gap-1">
          {TEXT_TOKENS.map(t => (
            <button
              key={t.token}
              title={t.label}
              onClick={() => onAddElement(defaultTextElement({ content: t.token, fontSize: 14, color: "#475569" }) as TemplateElement)}
              className="px-2 py-0.5 rounded text-[10px] font-mono border border-[#d4af37]/30 text-[#d4af37]/80 hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-colors"
            >
              {t.token}
            </button>
          ))}
        </div>
      </div>

      {/* Layers */}
      <div className="p-3">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">Layers ({template.elements.length})</p>
        <div className="space-y-0.5">
          {sorted.map(el => (
            <div
              key={el.id}
              onClick={() => onSelectElement(el.id)}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                selectedId === el.id
                  ? "bg-[#3b82f6]/15 border border-[#3b82f6]/40"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <span className="text-white/30 w-3 flex items-center justify-center shrink-0">{elIcon(el.type)}</span>
              <span className={`flex-1 text-xs truncate ${el.visible ? "text-white/70" : "text-white/20 line-through"}`}>
                {elLabel(el)}
              </span>
              {/* Actions - only visible on hover or when selected */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={e => { e.stopPropagation(); move(el.id, "up") }}
                  className="w-4 h-4 flex items-center justify-center text-white/30 hover:text-white"
                  title="Bring forward"
                >
                  <ChevronUp size={10} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); move(el.id, "down") }}
                  className="w-4 h-4 flex items-center justify-center text-white/30 hover:text-white"
                  title="Send backward"
                >
                  <ChevronDown size={10} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onToggleVisibility(el.id) }}
                  className="w-4 h-4 flex items-center justify-center text-white/30 hover:text-white"
                  title={el.visible ? "Hide" : "Show"}
                >
                  {el.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onToggleLock(el.id) }}
                  className="w-4 h-4 flex items-center justify-center text-white/30 hover:text-white"
                  title={el.locked ? "Unlock" : "Lock"}
                >
                  {el.locked ? <Lock size={10} /> : <Unlock size={10} />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onDuplicateElement(el.id) }}
                  className="w-4 h-4 flex items-center justify-center text-white/30 hover:text-white"
                  title="Duplicate"
                >
                  <Copy size={10} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onRemoveElement(el.id) }}
                  className="w-4 h-4 flex items-center justify-center text-white/30 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
