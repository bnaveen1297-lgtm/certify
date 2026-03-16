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

interface LayerPanelProps {
  template: CertificateTemplate
  selectedId: string | null
  onSelectElement: (id: string | null) => void
  onAddElement: (el: TemplateElement | TemplateElement[]) => void
  onRemoveElement: (id: string) => void
  onDuplicateElement: (id: string) => void
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void
  onReorderElements: (fromIndex: number, toIndex: number) => void
}

// Add element options
const ADD_ITEMS: { label: string; icon: React.ReactNode; make: () => TemplateElement | TemplateElement[] }[] = [
  { label: "Heading", icon: <span className="font-black text-[11px]">H</span>, make: () => defaultHeadingElement() },
  { label: "Text", icon: <Type size={13} />, make: () => defaultTextElement({ content: "Click to edit text" }) },
  { label: "Token", icon: <span className="text-[9px] font-bold font-mono">{"{T}"}</span>, make: () => defaultTextElement({ content: "{FullName}", fontSize: 22, fontWeight: "700" }) },
  { label: "Divider", icon: <Minus size={13} />, make: () => defaultDivider() },
  { label: "Rectangle", icon: <Square size={13} />, make: () => defaultRectangle() },
  { label: "Ellipse", icon: <Circle size={13} />, make: () => defaultEllipse() },
  { label: "Logo", icon: <Star size={13} />, make: () => defaultLogoElement("logo_organizer") },
]

// Border presets
const BORDER_PRESETS: { label: string; make: () => TemplateElement[] }[] = [
  {
    label: "Simple Border",
    make: () => [defaultRectangle({ x: 20, y: 20, width: 754, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false })],
  },
  {
    label: "Double Border",
    make: () => [
      defaultRectangle({ x: 15, y: 15, width: 764, height: 526, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 25, y: 25, width: 744, height: 506, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Gold Frame",
    make: () => [
      defaultRectangle({ x: 10, y: 10, width: 774, height: 536, fill: "transparent", stroke: "#b8860b", strokeWidth: 4, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 18, y: 18, width: 758, height: 520, fill: "transparent", stroke: "#d4af37", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Rounded Border",
    make: () => [defaultRectangle({ x: 20, y: 20, width: 754, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 12, locked: false })],
  },
  {
    label: "Corner Accents",
    make: () => [
      defaultRectangle({ x: 20, y: 20, width: 754, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 15, y: 15, width: 40, height: 40, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 739, y: 15, width: 40, height: 40, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 15, y: 501, width: 40, height: 40, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 739, y: 501, width: 40, height: 40, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Modern Minimal",
    make: () => [
      defaultDivider({ x: 40, y: 30, width: 714, stroke: "#333", strokeWidth: 2 }),
      defaultDivider({ x: 40, y: 526, width: 714, stroke: "#333", strokeWidth: 2 }),
    ],
  },
]

function elIcon(el: TemplateElement): React.ReactNode {
  switch (el.type) {
    case "text": return <Type size={14} className="text-muted-foreground" />
    case "divider": return <Minus size={14} className="text-muted-foreground" />
    case "rect": return <Square size={14} className="text-muted-foreground" />
    case "ellipse": return <Circle size={14} className="text-muted-foreground" />
    case "logo": return <Star size={14} className="text-muted-foreground" />
    case "image": return <Frame size={14} className="text-muted-foreground" />
    default: return <Square size={14} className="text-muted-foreground" />
  }
}

function elLabel(el: TemplateElement): string {
  if (el.type === "text") {
    const txt = (el as any).content as string
    return txt.length > 18 ? txt.slice(0, 18) + "..." : txt
  }
  if (el.type === "logo") return (el as any).logoType === "logo_sponsor" ? "Sponsor Logo" : "Organizer Logo"
  if (el.type === "divider") return "Divider"
  if (el.type === "rect") return "Rectangle"
  if (el.type === "ellipse") return "Ellipse"
  if (el.type === "image") return "Image"
  return el.type
}

export function ElementsPanel({
  template, selectedId, onSelectElement, onAddElement, onRemoveElement,
  onDuplicateElement, onUpdateElement, onReorderElements,
}: LayerPanelProps) {
  const [addOpen, setAddOpen] = useState(true)
  const [bordersOpen, setBordersOpen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(true)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const elements = template.elements

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">Elements</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {/* Add Elements */}
          <Collapsible open={addOpen} onOpenChange={setAddOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground py-1">
              {addOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Add Elements
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-4 gap-1 pt-2">
                {ADD_ITEMS.map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    size="sm"
                    className="h-12 flex flex-col gap-0.5 text-[10px] px-1"
                    onClick={() => onAddElement(item.make())}
                  >
                    <span className="text-muted-foreground">{item.icon}</span>
                    {item.label}
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Borders & Frames */}
          <Collapsible open={bordersOpen} onOpenChange={setBordersOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground py-1">
              {bordersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Borders & Frames
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-1 pt-2">
                {BORDER_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] px-2"
                    onClick={() => onAddElement(preset.make())}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Layers */}
          <Collapsible open={layersOpen} onOpenChange={setLayersOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground py-1">
              {layersOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Layers ({elements.length})
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-0.5 pt-2">
                {elements.slice().reverse().map((el, revIdx) => {
                  const idx = elements.length - 1 - revIdx
                  const isSelected = el.id === selectedId
                  return (
                    <div
                      key={el.id}
                      draggable
                      onDragStart={() => setDragIdx(idx)}
                      onDragOver={(e) => { e.preventDefault() }}
                      onDrop={() => {
                        if (dragIdx !== null && dragIdx !== idx) {
                          onReorderElements(dragIdx, idx)
                        }
                        setDragIdx(null)
                      }}
                      onDragEnd={() => setDragIdx(null)}
                      onClick={() => onSelectElement(el.id)}
                      className={cn(
                        "group flex items-center gap-1 px-1.5 py-1 rounded text-xs cursor-pointer transition-colors",
                        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted",
                        el.locked && "opacity-60"
                      )}
                    >
                      <GripVertical size={12} className="text-muted-foreground cursor-grab" />
                      {elIcon(el)}
                      <span className="flex-1 truncate text-[11px]">{elLabel(el)}</span>

                      {/* Action buttons - always visible */}
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateElement(el.id, { visible: !el.visible }) }}
                          className="p-0.5 rounded hover:bg-muted-foreground/20"
                          title={el.visible ? "Hide" : "Show"}
                        >
                          {el.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onUpdateElement(el.id, { locked: !el.locked }) }}
                          className="p-0.5 rounded hover:bg-muted-foreground/20"
                          title={el.locked ? "Unlock" : "Lock"}
                        >
                          {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDuplicateElement(el.id) }}
                          className="p-0.5 rounded hover:bg-muted-foreground/20"
                          title="Duplicate"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveElement(el.id) }}
                          className="p-0.5 rounded hover:bg-destructive/20 text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {elements.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No elements yet</p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )
}
