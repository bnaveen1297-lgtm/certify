"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { ChevronDown, ChevronRight, Copy, Eye, EyeOff, Lock, Unlock, Trash2, Plus, Type, Minus, Square, Circle, Star, GripVertical, Frame, Trophy, Award, Medal, Ribbon, Sparkles, Heart, Baby, Smile, Sun, Zap, Crown, ImageIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { CertificateTemplate, TemplateElement, TextElement, ImageElement } from "@/lib/template-editor"
import {
  defaultTextElement, defaultHeadingElement, defaultDivider,
  defaultRectangle, defaultEllipse, defaultLogoElement, genId,
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

// Basic elements
const ADD_ITEMS: { label: string; icon: React.ReactNode; make: () => TemplateElement | TemplateElement[] }[] = [
  { label: "Heading", icon: <span className="font-black text-[11px]">H</span>, make: () => defaultHeadingElement() },
  { label: "Text", icon: <Type size={13} />, make: () => defaultTextElement({ content: "Click to edit text" }) },
  { label: "Token", icon: <span className="text-[9px] font-bold font-mono">{"{T}"}</span>, make: () => defaultTextElement({ content: "{FullName}", fontSize: 22, fontWeight: "700" }) },
  { label: "Divider", icon: <Minus size={13} />, make: () => defaultDivider() },
  { label: "Rectangle", icon: <Square size={13} />, make: () => defaultRectangle() },
  { label: "Ellipse", icon: <Circle size={13} />, make: () => defaultEllipse() },
  { label: "Logo", icon: <Star size={13} />, make: () => defaultLogoElement("logo_organizer") },
]

// Award & Trophy icons
const AWARD_ICONS: { label: string; icon: React.ReactNode; emoji: string; color: string }[] = [
  { label: "Trophy", icon: <Trophy size={13} />, emoji: "🏆", color: "#d4af37" },
  { label: "Gold Medal", icon: <Medal size={13} />, emoji: "🥇", color: "#d4af37" },
  { label: "Silver Medal", icon: <Medal size={13} />, emoji: "🥈", color: "#c0c0c0" },
  { label: "Bronze Medal", icon: <Medal size={13} />, emoji: "🥉", color: "#cd7f32" },
  { label: "Award Badge", icon: <Award size={13} />, emoji: "🏅", color: "#d4af37" },
  { label: "Crown", icon: <Crown size={13} />, emoji: "👑", color: "#d4af37" },
  { label: "Star", icon: <Star size={13} />, emoji: "⭐", color: "#d4af37" },
  { label: "Sparkle Star", icon: <Sparkles size={13} />, emoji: "🌟", color: "#d4af37" },
  { label: "Ribbon", icon: <Ribbon size={13} />, emoji: "🎀", color: "#e91e63" },
  { label: "Certificate", icon: <Award size={13} />, emoji: "📜", color: "#8b4513" },
  { label: "Check Mark", icon: <Zap size={13} />, emoji: "✅", color: "#4caf50" },
  { label: "Champion", icon: <Trophy size={13} />, emoji: "🏅", color: "#d4af37" },
]

// Kids icons
const KIDS_ICONS: { label: string; icon: React.ReactNode; emoji: string; color: string }[] = [
  { label: "Star Eyes", icon: <Smile size={13} />, emoji: "🤩", color: "#ffd700" },
  { label: "Thumbs Up", icon: <Heart size={13} />, emoji: "👍", color: "#f0c14b" },
  { label: "Clap", icon: <Sparkles size={13} />, emoji: "👏", color: "#f0c14b" },
  { label: "Party", icon: <Sparkles size={13} />, emoji: "🎉", color: "#ff6b6b" },
  { label: "Balloon", icon: <Circle size={13} />, emoji: "🎈", color: "#ff4081" },
  { label: "Rainbow", icon: <Sun size={13} />, emoji: "🌈", color: "#ff6b6b" },
  { label: "Sun", icon: <Sun size={13} />, emoji: "☀️", color: "#ffc107" },
  { label: "Heart", icon: <Heart size={13} />, emoji: "❤️", color: "#e91e63" },
  { label: "Sparkles", icon: <Sparkles size={13} />, emoji: "✨", color: "#ffd700" },
  { label: "Fire", icon: <Zap size={13} />, emoji: "🔥", color: "#ff5722" },
  { label: "Lightning", icon: <Zap size={13} />, emoji: "⚡", color: "#ffc107" },
  { label: "Rocket", icon: <Zap size={13} />, emoji: "🚀", color: "#2196f3" },
  { label: "Super Star", icon: <Star size={13} />, emoji: "💫", color: "#9c27b0" },
  { label: "100 Points", icon: <Award size={13} />, emoji: "💯", color: "#f44336" },
  { label: "Muscle", icon: <Zap size={13} />, emoji: "💪", color: "#f0c14b" },
  { label: "Cool", icon: <Smile size={13} />, emoji: "😎", color: "#2196f3" },
]

// Border presets
const BORDER_PRESETS: { label: string; make: () => TemplateElement[] }[] = [
  {
    label: "Simple Border",
    make: () => [
      defaultRectangle({ x: 20, y: 20, width: 760, height: 526, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Double Border",
    make: () => [
      defaultRectangle({ x: 15, y: 15, width: 770, height: 536, fill: "transparent", stroke: "#1a365d", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 25, y: 25, width: 750, height: 516, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Classic Certificate",
    make: () => [
      defaultRectangle({ x: 8, y: 8, width: 784, height: 550, fill: "transparent", stroke: "#1a365d", strokeWidth: 4, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 16, y: 16, width: 768, height: 534, fill: "transparent", stroke: "#b8860b", strokeWidth: 2, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 28, y: 28, width: 744, height: 510, fill: "transparent", stroke: "#1a365d", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Gold Elegant",
    make: () => [
      defaultRectangle({ x: 10, y: 10, width: 780, height: 546, fill: "transparent", stroke: "#d4af37", strokeWidth: 3, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 18, y: 18, width: 764, height: 530, fill: "transparent", stroke: "#d4af3780", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Modern Rounded",
    make: () => [
      defaultRectangle({ x: 16, y: 16, width: 768, height: 534, fill: "transparent", stroke: "#334155", strokeWidth: 2, borderRadius: 12, locked: false }),
    ],
  },
  {
    label: "Thick Frame",
    make: () => [
      defaultRectangle({ x: 0, y: 0, width: 800, height: 566, fill: "transparent", stroke: "#1e3a5f", strokeWidth: 14, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Corner Accents",
    make: () => [
      defaultRectangle({ x: 8, y: 8, width: 24, height: 24, fill: "#d4af37", stroke: "transparent", strokeWidth: 0, borderRadius: 2, locked: false }),
      defaultRectangle({ x: 768, y: 8, width: 24, height: 24, fill: "#d4af37", stroke: "transparent", strokeWidth: 0, borderRadius: 2, locked: false }),
      defaultRectangle({ x: 8, y: 534, width: 24, height: 24, fill: "#d4af37", stroke: "transparent", strokeWidth: 0, borderRadius: 2, locked: false }),
      defaultRectangle({ x: 768, y: 534, width: 24, height: 24, fill: "#d4af37", stroke: "transparent", strokeWidth: 0, borderRadius: 2, locked: false }),
    ],
  },
  {
    label: "Top & Bottom Stripes",
    make: () => [
      defaultRectangle({ x: 0, y: 0, width: 800, height: 18, fill: "#d4af37", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 0, y: 548, width: 800, height: 18, fill: "#d4af37", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Left Accent Bar",
    make: () => [
      defaultRectangle({ x: 0, y: 0, width: 12, height: 566, fill: "#1e3a5f", stroke: "transparent", strokeWidth: 0, borderRadius: 0, locked: false }),
    ],
  },
  {
    label: "Ornate Triple",
    make: () => [
      defaultRectangle({ x: 4, y: 4, width: 792, height: 558, fill: "transparent", stroke: "#8b0000", strokeWidth: 5, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 14, y: 14, width: 772, height: 538, fill: "transparent", stroke: "#8b0000", strokeWidth: 1, borderRadius: 0, locked: false }),
      defaultRectangle({ x: 20, y: 20, width: 760, height: 526, fill: "transparent", stroke: "#8b000060", strokeWidth: 1, borderRadius: 0, locked: false }),
    ],
  },
]

// Helper function to create emoji/icon text element
function createIconElement(emoji: string, color: string): TextElement {
  return defaultTextElement({
    content: emoji,
    fontSize: 48,
    color: color,
    x: 360,
    y: 60,
    width: 80,
    height: 72,
    fontFamily: "system-ui, sans-serif",
    textAlign: "center",
    backgroundColor: "transparent",
  })
}

// Helper function to create image element
function createImageElement(): ImageElement {
  return {
    id: genId(),
    type: "image",
    x: 300,
    y: 200,
    width: 200,
    height: 150,
    rotation: 0,
    opacity: 100,
    locked: false,
    visible: true,
    zIndex: 10,
    src: "",
    objectFit: "contain",
    borderRadius: 0,
  }
}

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
  const [openAwards, setOpenAwards] = useState(false)
  const [openKids, setOpenKids] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedEl = template.elements.find(e => e.id === selectedId)

  const getElementLabel = (el: TemplateElement): string => {
    if ("content" in el) return (el as any).content?.substring(0, 20) || "Text"
    if (el.type === "image") return "Image"
    if (el.type === "logo_organizer") return "Organizer Logo"
    if (el.type === "logo_sponsor") return "Sponsor Logo"
    return `${el.type[0].toUpperCase()}${el.type.slice(1)}`
  }

  const getElementIcon = (el: TemplateElement): React.ReactNode => {
    switch (el.type) {
      case "text":
      case "heading":
        return <Type size={12} />
      case "rectangle":
        return <Square size={12} />
      case "ellipse":
        return <Circle size={12} />
      case "divider":
        return <Minus size={12} />
      case "logo_organizer":
      case "logo_sponsor":
        return <Star size={12} />
      case "image":
        return <ImageIcon size={12} />
      default:
        return <Square size={12} />
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const imgEl = createImageElement()
      imgEl.src = ev.target?.result as string
      onAddElement(imgEl)
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Drag and drop handlers for reordering
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (draggedId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragEnd = () => {
    if (draggedId && dragOverId && draggedId !== dragOverId) {
      const elements = [...template.elements]
      const draggedIndex = elements.findIndex(el => el.id === draggedId)
      const dropIndex = elements.findIndex(el => el.id === dragOverId)
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        const [draggedEl] = elements.splice(draggedIndex, 1)
        elements.splice(dropIndex, 0, draggedEl)
        // Update zIndex based on new order
        const reordered = elements.map((el, idx) => ({ ...el, zIndex: idx + 1 }))
        onReorderElements(reordered as TemplateElement[])
      }
    }
    setDraggedId(null)
    setDragOverId(null)
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
            
            {/* Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-start gap-2 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
            >
              <Upload size={13} />
              Upload Image
            </Button>
          </div>

          {/* Award Icons */}
          <Collapsible open={openAwards} onOpenChange={setOpenAwards} className="mt-4">
            <CollapsibleTrigger className="flex items-center gap-1.5 px-1 py-2 text-xs font-semibold text-white/50 uppercase hover:text-white/70 w-full">
              <ChevronRight size={12} className={cn("transition-transform", openAwards && "rotate-90")} />
              <Trophy size={12} className="text-[#d4af37]" />
              Award Icons
            </CollapsibleTrigger>
            <CollapsibleContent className="grid grid-cols-4 gap-1.5 pl-1 pr-1 mt-2">
              {AWARD_ICONS.map(item => (
                <button
                  key={item.label}
                  onClick={() => onAddElement(createIconElement(item.emoji, item.color))}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded border border-white/10 hover:border-[#d4af37]/40 hover:bg-[#d4af37]/10 transition-colors"
                  title={item.label}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[9px] text-white/40 truncate w-full text-center">{item.label}</span>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Kids Icons */}
          <Collapsible open={openKids} onOpenChange={setOpenKids} className="mt-2">
            <CollapsibleTrigger className="flex items-center gap-1.5 px-1 py-2 text-xs font-semibold text-white/50 uppercase hover:text-white/70 w-full">
              <ChevronRight size={12} className={cn("transition-transform", openKids && "rotate-90")} />
              <Smile size={12} className="text-[#ff6b6b]" />
              Kids Icons
            </CollapsibleTrigger>
            <CollapsibleContent className="grid grid-cols-4 gap-1.5 pl-1 pr-1 mt-2">
              {KIDS_ICONS.map(item => (
                <button
                  key={item.label}
                  onClick={() => onAddElement(createIconElement(item.emoji, item.color))}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded border border-white/10 hover:border-[#ff6b6b]/40 hover:bg-[#ff6b6b]/10 transition-colors"
                  title={item.label}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-[9px] text-white/40 truncate w-full text-center">{item.label}</span>
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Borders & Frames */}
          <Collapsible open={openBorders} onOpenChange={setOpenBorders} className="mt-2">
            <CollapsibleTrigger className="flex items-center gap-1.5 px-1 py-2 text-xs font-semibold text-white/50 uppercase hover:text-white/70 w-full">
              <ChevronRight size={12} className={cn("transition-transform", openBorders && "rotate-90")} />
              <Frame size={12} className="text-[#60a5fa]" />
              Borders & Frames
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1.5 pl-1 pr-1 mt-2">
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
            <p className="text-xs font-semibold text-white/50 uppercase px-1">Layers ({template.elements.length})</p>
            {template.elements.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">No elements yet</p>
            ) : (
              [...template.elements].reverse().map((el, idx) => (
                <div
                  key={el.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, el.id)}
                  onDragOver={(e) => handleDragOver(e, el.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectElement(el.id)}
                  className={cn(
                    "group flex items-center gap-1.5 px-2 py-2 rounded cursor-pointer transition-colors",
                    selectedId === el.id ? "bg-[#d4af37]/20 border border-[#d4af37]/40" : "hover:bg-white/5 border border-transparent",
                    dragOverId === el.id && "border-[#60a5fa] bg-[#60a5fa]/10"
                  )}
                >
                  <GripVertical size={12} className="text-white/30 shrink-0 cursor-grab active:cursor-grabbing" />
                  <span className="text-white/40 shrink-0">{getElementIcon(el)}</span>
                  <span className="flex-1 text-xs truncate">{getElementLabel(el)}</span>
                  
                  {/* Action buttons - always visible */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(el.id) }}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded hover:bg-white/10 transition-colors",
                      el.visible === false ? "text-orange-400" : "text-white/40 hover:text-white/60"
                    )}
                    title={el.visible === false ? "Show" : "Hide"}
                  >
                    {el.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleLock(el.id) }}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded hover:bg-white/10 transition-colors",
                      el.locked ? "text-orange-400" : "text-white/40 hover:text-white/60"
                    )}
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
