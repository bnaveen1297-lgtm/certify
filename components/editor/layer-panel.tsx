"use client"

import React, { useState } from "react"
import {
  Type, Minus, Square, Circle, Image as ImageIcon, Star, Trophy,
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, GripVertical, Frame,
  ChevronDown, ChevronRight, Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CertificateTemplate, TemplateElement } from "@/lib/template-editor"
import {
  defaultTextElement, defaultHeadingElement, defaultDividerElement,
  defaultShapeElement, defaultLogoElement, defaultImageElement,
} from "@/lib/template-editor"

interface LayerPanelProps {
  template: CertificateTemplate
  selectedId: string | null
  onSelectElement: (id: string | null) => void
  onAddElement: (el: TemplateElement | TemplateElement[]) => void
  onRemoveElement: (id: string) => void
  onDuplicateElement: (id: string) => void
  onReorderElements: (fromIndex: number, toIndex: number) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
}

const ADD_ITEMS: { label: string; icon: React.ReactNode; make: () => TemplateElement | TemplateElement[] }[] = [
  { label: "Heading", icon: <span className="font-black text-[11px]">H</span>, make: () => defaultHeadingElement() },
  { label: "Text", icon: <Type size={13} />, make: () => defaultTextElement({ content: "Click to edit text" }) },
  { label: "Token", icon: <span className="text-[9px] font-bold font-mono">{"{T}"}</span>, make: () => defaultTextElement({ content: "{FullName}", fontSize: 22, fontWeight: "700" }) },
  { label: "Divider", icon: <Minus size={13} />, make: () => defaultDividerElement() },
  { label: "Rectangle", icon: <Square size={13} />, make: () => defaultShapeElement({ shape: "rect" }) },
  { label: "Ellipse", icon: <Circle size={13} />, make: () => defaultShapeElement({ shape: "ellipse" }) },
  { label: "Logo", icon: <Star size={13} />, make: () => defaultLogoElement() },
  { label: "Image", icon: <ImageIcon size={13} />, make: () => defaultImageElement() },
]

// Borders & Frames presets
const BORDER_PRESETS: { label: string; make: () => TemplateElement[] }[] = [
  {
    label: "Simple Border",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 20, y: 20, width: 754, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Double Border",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 15, y: 15, width: 764, height: 526, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 25, y: 25, width: 744, height: 506, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Triple Border",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 10, y: 10, width: 774, height: 536, fill: "transparent", stroke: "#b8860b", strokeWidth: 3, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 20, y: 20, width: 754, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 30, y: 30, width: 734, height: 496, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Rounded Border",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 20, y: 20, width: 754, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 12, locked: false }),
    ],
  },
  {
    label: "Gold Frame",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 10, y: 10, width: 774, height: 536, fill: "transparent", stroke: "#b8860b", strokeWidth: 4, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 18, y: 18, width: 758, height: 520, fill: "transparent", stroke: "#d4af37", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Corner Accents",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 20, y: 20, width: 754, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 15, y: 15, width: 40, height: 40, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 739, y: 15, width: 40, height: 40, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 15, y: 501, width: 40, height: 40, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 739, y: 501, width: 40, height: 40, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Elegant Double",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 12, y: 12, width: 770, height: 532, fill: "transparent", stroke: "#2c5282", strokeWidth: 3, borderRadius: 4, locked: false }),
      defaultShapeElement({ shape: "rect", x: 24, y: 24, width: 746, height: 508, fill: "transparent", stroke: "#b8860b", strokeWidth: 1, borderRadius: 2, locked: false }),
    ],
  },
  {
    label: "Classic Certificate",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 8, y: 8, width: 778, height: 540, fill: "transparent", stroke: "#1a365d", strokeWidth: 4, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 16, y: 16, width: 762, height: 524, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 28, y: 28, width: 738, height: 500, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Modern Minimal",
    make: () => [
      defaultDividerElement({ x: 40, y: 30, width: 714, stroke: "#333", strokeWidth: 2 }),
      defaultDividerElement({ x: 40, y: 526, width: 714, stroke: "#333", strokeWidth: 2 }),
    ],
  },
  {
    label: "Side Accents",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 15, y: 50, width: 6, height: 456, fill: "#b8860b", stroke: "transparent", strokeWidth: 0, borderRadius: 3, locked: false }),
      defaultShapeElement({ shape: "rect", x: 773, y: 50, width: 6, height: 456, fill: "#b8860b", stroke: "transparent", strokeWidth: 0, borderRadius: 3, locked: false }),
    ],
  },
  {
    label: "Chess Pattern",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 10, y: 10, width: 774, height: 536, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 20, y: 20, width: 20, height: 20, fill: "#1a365d", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 754, y: 20, width: 20, height: 20, fill: "#1a365d", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 20, y: 516, width: 20, height: 20, fill: "#1a365d", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "rect", x: 754, y: 516, width: 20, height: 20, fill: "#1a365d", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Award Style",
    make: () => [
      defaultShapeElement({ shape: "rect", x: 15, y: 15, width: 764, height: 526, fill: "transparent", stroke: "#b8860b", strokeWidth: 3, borderRadius: 8, locked: false }),
      defaultShapeElement({ shape: "ellipse", x: 367, y: 5, width: 60, height: 30, fill: "#b8860b", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
      defaultShapeElement({ shape: "ellipse", x: 367, y: 521, width: 60, height: 30, fill: "#b8860b", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
    ],
  },
]

function elIcon(type: string) {
  switch (type) {
    case "heading": return <span className="font-black text-[9px] text-white/50">H</span>
    case "text": return <Type size={10} className="text-white/40" />
    case "divider": return <Minus size={10} className="text-white/40" />
    case "rect": return <Square size={10} className="text-white/40" />
    case "ellipse": return <Circle size={10} className="text-white/40" />
    case "logo": return <Star size={10} className="text-white/40" />
    case "image": return <ImageIcon size={10} className="text-white/40" />
    default: return <Frame size={10} className="text-white/40" />
  }
}

function elLabel(el: TemplateElement): string {
  if (el.type === "text" || el.type === "heading") {
    const content = (el as any).content as string
    const clean = content.replace(/\{|\}/g, "")
    return clean.length > 18 ? clean.slice(0, 18) + "..." : clean
  }
  return el.type.charAt(0).toUpperCase() + el.type.slice(1)
}

export function LayerPanel({
  template, selectedId,
  onSelectElement, onAddElement, onRemoveElement, onDuplicateElement,
  onReorderElements, onToggleVisibility, onToggleLock,
}: LayerPanelProps) {
  const [bordersOpen, setBordersOpen] = useState(false)

  return (
    <div className="flex flex-col h-full text-xs select-none">
      {/* Add buttons */}
      <div className="p-2 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Add Element</div>
        <div className="grid grid-cols-4 gap-1">
          {ADD_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => onAddElement(item.make())}
              className="flex flex-col items-center justify-center gap-0.5 p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title={item.label}
            >
              {item.icon}
              <span className="text-[8px] leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Borders & Frames collapsible */}
      <div className="border-b border-white/10">
        <button
          onClick={() => setBordersOpen(!bordersOpen)}
          className="w-full flex items-center gap-1 p-2 text-[10px] uppercase tracking-wider text-white/40 hover:text-white/60"
        >
          {bordersOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Borders & Frames
        </button>
        {bordersOpen && (
          <div className="px-2 pb-2 grid grid-cols-2 gap-1">
            {BORDER_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => onAddElement(preset.make())}
                className="text-[9px] text-left px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors truncate"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layers list */}
      <div className="flex-1 overflow-y-auto p-1">
        <div className="text-[10px] uppercase tracking-wider text-white/40 px-1 py-1">Layers</div>
        {[...template.elements].reverse().map((el, revIdx) => {
          const idx = template.elements.length - 1 - revIdx
          const selected = el.id === selectedId
          return (
            <div
              key={el.id}
              onClick={() => onSelectElement(el.id)}
              className={cn(
                "group flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer transition-colors",
                selected ? "bg-blue-600/40" : "hover:bg-white/10",
                el.hidden && "opacity-50"
              )}
            >
              <GripVertical size={10} className="text-white/30 flex-shrink-0 cursor-grab" />
              <span className="flex-shrink-0">{elIcon(el.type)}</span>
              <span className="flex-1 truncate text-white/80 text-[11px]">{elLabel(el)}</span>

              {/* Action buttons - always visible */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost" size="icon"
                  className="h-5 w-5 text-white/50 hover:text-white hover:bg-white/10"
                  onClick={e => { e.stopPropagation(); onToggleVisibility(el.id) }}
                  title={el.hidden ? "Show" : "Hide"}
                >
                  {el.hidden ? <EyeOff size={11} /> : <Eye size={11} />}
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-5 w-5 text-white/50 hover:text-white hover:bg-white/10"
                  onClick={e => { e.stopPropagation(); onToggleLock(el.id) }}
                  title={el.locked ? "Unlock" : "Lock"}
                >
                  {el.locked ? <Lock size={11} /> : <Unlock size={11} />}
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-5 w-5 text-white/50 hover:text-white hover:bg-white/10"
                  onClick={e => { e.stopPropagation(); onDuplicateElement(el.id) }}
                  title="Duplicate"
                >
                  <Copy size={11} />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-5 w-5 text-white/50 hover:text-red-400 hover:bg-white/10"
                  onClick={e => { e.stopPropagation(); onRemoveElement(el.id) }}
                  title="Delete"
                >
                  <Trash2 size={11} />
                </Button>
              </div>
            </div>
          )
        })}
        {template.elements.length === 0 && (
          <div className="text-white/30 text-center py-4 text-[10px]">No elements yet</div>
        )}
      </div>
    </div>
  )
}

// Re-export as ElementsPanel for backwards compatibility
export { LayerPanel as ElementsPanel }
