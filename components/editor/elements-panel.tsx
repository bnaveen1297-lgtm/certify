"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, Copy, Eye, EyeOff, Lock, Unlock, Trash2, Plus, Type, Minus, Square, Circle, Star, GripVertical, Frame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { CertificateTemplate, TemplateElement } from "@/lib/template-editor"
import {
  defaultTextElement, defaultHeadingElement, defaultDivider,
  defaultRectangle, defaultEllipse, defaultLogoElement,
} from "@/lib/template-editor"

interface ElementsPanelProps {
  template: CertificateTemplate
  selectedId: string | null
  onSelectElement: (id: string | null) => void
  onAddElement: (el: TemplateElement | TemplateElement[]) => void
  onRemoveElement: (id: string) => void
  onDuplicateElement: (id: string) => void
  onReorderElements: (elements: TemplateElement[]) => void
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
}

const ADD_ITEMS: { label: string; icon: React.ReactNode; make: () => TemplateElement | TemplateElement[] }[] = [
  { label: "Heading", icon: <span className="font-black text-[11px]">H</span>, make: () => defaultHeadingElement() },
  { label: "Text", icon: <Type size={13} />, make: () => defaultTextElement({ content: "Click to edit text" }) },
  { label: "Token", icon: <span className="text-[9px] font-bold font-mono">{"{T}"}</span>, make: () => defaultTextElement({ content: "{FullName}", fontSize: 22, fontWeight: "700" }) },
  { label: "Divider", icon: <Minus size={13} />, make: () => defaultDivider() },
  { label: "Rectangle", icon: <Square size={13} />, make: () => defaultRectangle() },
  { label: "Ellipse", icon: <Circle size={13} />, make: () => defaultEllipse() },
  { label: "Logo", icon: <Star size={13} />, make: () => defaultLogoElement("logo_organizer") },
]

const BORDER_PRESETS: { label: string; make: () => TemplateElement[] }[] = [
  {
    label: "Simple Border",
    make: () => [
      defaultRectangle({ x: 20, y: 20, width: 754, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Double Border",
    make: () => [
      defaultRectangle({ x: 15, y: 15, width: 764, height: 526, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 25, y: 25, width: 744, height: 506, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Classic Certificate",
    make: () => [
      defaultRectangle({ x: 8, y: 8, width: 778, height: 540, fill: "transparent", stroke: "#1a365d", strokeWidth: 4, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 16, y: 16, width: 762, height: 524, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 28, y: 28, width: 738, height: 500, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
]

export function ElementsPanel({
  template,
  selectedId,
  onSelectElement,
  onAddElement,
  onRemoveElement,
  onDuplicateElement,
  onReorderElements,
  onToggleVisibility,
  onToggleLock,
}: ElementsPanelProps) {
  const [openBorders, setOpenBorders] = useState(false)

  const selectedEl = template.elements.find(e => e.id === selectedId)

  const getElementLabel = (el: TemplateElement): string => {
    if ("content" in el) return (el as any).content?.substring(0, 20) || "Text"
    return `${el.type[0].toUpperCase()}${el.type.slice(1)}`
  }

  return (
    <div className="flex flex-col h-full text-white/80 text-sm">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Add Elements */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-white/50 uppercase px-1">Add Elements</p>
            {ADD_ITEMS.map(item => (
              <Button
                key={item.label}
                size="sm"
                variant="outline"
                onClick={() => onAddElement(item.make())}
                className="w-full justify-start gap-2 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>

          {/* Borders & Frames */}
          <Collapsible open={openBorders} onOpenChange={setOpenBorders} className="mt-4">
            <CollapsibleTrigger className="flex items-center gap-1.5 px-1 py-2 text-xs font-semibold text-white/50 uppercase hover:text-white/70 w-full">
              <ChevronRight size={12} className={cn("transition-transform", openBorders && "rotate-90")} />
              Borders & Frames
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1.5 pl-3 mt-1">
              {BORDER_PRESETS.map(preset => (
                <Button
                  key={preset.label}
                  size="sm"
                  variant="outline"
                  onClick={() => onAddElement(preset.make())}
                  className="w-full justify-start gap-2 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
                >
                  <Frame size={12} />
                  {preset.label}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Layers */}
          <div className="mt-4 space-y-1.5">
            <p className="text-xs font-semibold text-white/50 uppercase px-1">Layers</p>
            {template.elements.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">No elements yet</p>
            ) : (
              template.elements.map((el, idx) => (
                <div
                  key={el.id}
                  onClick={() => onSelectElement(el.id)}
                  className={cn(
                    "group flex items-center gap-1.5 px-2 py-2 rounded cursor-pointer transition-colors",
                    selectedId === el.id ? "bg-[#d4af37]/20 border border-[#d4af37]/40" : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <GripVertical size={12} className="text-white/30 shrink-0" />
                  <span className="flex-1 text-xs truncate">{getElementLabel(el)}</span>
                  
                  {/* Action buttons - always visible */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(el.id) }}
                    className="flex h-5 w-5 items-center justify-center text-white/40 hover:text-white/60 rounded hover:bg-white/10 transition-colors"
                    title={el.visible === false ? "Show" : "Hide"}
                  >
                    {el.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleLock(el.id) }}
                    className="flex h-5 w-5 items-center justify-center text-white/40 hover:text-white/60 rounded hover:bg-white/10 transition-colors"
                    title={el.locked ? "Unlock" : "Lock"}
                  >
                    {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicateElement(el.id) }}
                    className="flex h-5 w-5 items-center justify-center text-white/40 hover:text-white/60 rounded hover:bg-white/10 transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveElement(el.id) }}
                    className="flex h-5 w-5 items-center justify-center text-white/40 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
