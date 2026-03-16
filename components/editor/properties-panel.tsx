"use client"

import { useRef } from "react"
import {
  CertificateTemplate, TemplateElement, CanvasBackground,
  TextElement, ShapeElement, DividerElement, LogoElement,
  FONT_FAMILIES,
} from "@/lib/template-editor"
import { Trash2, Copy, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PropertiesPanelProps {
  template: CertificateTemplate
  selectedElement: TemplateElement | null
  onUpdateElement: (patch: Partial<TemplateElement>) => void
  onUpdateBackground: (bg: Partial<CanvasBackground>) => void
  onDeleteElement: () => void
  onDuplicateElement: () => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-h-[28px]">
      <span className="text-[10px] text-white/40 w-[72px] shrink-0 leading-tight">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-white/10 space-y-2.5">
      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex-shrink-0">
        <input
          type="color"
          value={value.startsWith("#") ? value : "#ffffff"}
          onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-white/20 bg-transparent p-0.5"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none focus:border-white/30 font-mono"
      />
    </div>
  )
}

function NumInput({ value, onChange, min, max, step = 1, unit = "" }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none focus:border-white/30"
      />
      {unit && <span className="text-[10px] text-white/30 shrink-0">{unit}</span>}
    </div>
  )
}

export function PropertiesPanel({
  template, selectedElement,
  onUpdateElement, onUpdateBackground,
  onDeleteElement, onDuplicateElement,
}: PropertiesPanelProps) {

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── No selection — show canvas properties
  if (!selectedElement) {
    const bg = template.background
    return (
      <div>
        <Section title="Canvas Background">
          <Row label="Bg Type">
            <select
              value={bg.type}
              onChange={e => onUpdateBackground({ type: e.target.value as any })}
              className="w-full h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none"
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
            </select>
          </Row>
          {bg.type === "solid" && (
            <Row label="Color">
              <ColorInput value={bg.color} onChange={c => onUpdateBackground({ color: c })} />
            </Row>
          )}
          {bg.type === "gradient" && (
            <Row label="Gradient">
              <input
                type="text"
                value={bg.gradient ?? ""}
                onChange={e => onUpdateBackground({ gradient: e.target.value })}
                placeholder="e.g. linear-gradient(135deg, #fff8e7, #fff)"
                className="w-full h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none"
              />
            </Row>
          )}
        </Section>
        <Section title="Border">
          <Row label="Color">
            <ColorInput value={bg.borderColor} onChange={c => onUpdateBackground({ borderColor: c })} />
          </Row>
          <Row label="Width">
            <NumInput value={bg.borderWidth} onChange={v => onUpdateBackground({ borderWidth: v })} min={0} max={20} unit="px" />
          </Row>
        </Section>
        <div className="px-4 py-4">
          <p className="text-xs text-white/30 text-center">Click any element on the canvas to edit its properties</p>
        </div>
      </div>
    )
  }

  const el = selectedElement

  // ── Shared position / size / transform section
  const posSection = (
    <Section title="Position & Size">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-white/30 mb-1">X</p>
          <NumInput value={el.x} onChange={v => onUpdateElement({ x: v })} min={0} unit="px" />
        </div>
        <div>
          <p className="text-[10px] text-white/30 mb-1">Y</p>
          <NumInput value={el.y} onChange={v => onUpdateElement({ y: v })} min={0} unit="px" />
        </div>
        <div>
          <p className="text-[10px] text-white/30 mb-1">W</p>
          <NumInput value={el.width} onChange={v => onUpdateElement({ width: v })} min={10} unit="px" />
        </div>
        <div>
          <p className="text-[10px] text-white/30 mb-1">H</p>
          <NumInput value={el.height} onChange={v => onUpdateElement({ height: v })} min={4} unit="px" />
        </div>
      </div>
      <Row label="Rotation">
        <NumInput value={el.rotation} onChange={v => onUpdateElement({ rotation: v })} min={-180} max={180} unit="°" />
      </Row>
      <Row label="Opacity">
        <NumInput value={el.opacity} onChange={v => onUpdateElement({ opacity: v })} min={0} max={100} unit="%" />
      </Row>
    </Section>
  )

  // ── Text element
  if (el.type === "text" || el.type === "heading") {
    const te = el as TextElement
    return (
      <div>
        <Section title="Content">
          <textarea
            value={te.content}
            onChange={e => onUpdateElement({ content: e.target.value } as any)}
            rows={3}
            className="w-full rounded px-2 py-1.5 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none focus:border-white/30 resize-none"
            placeholder="Text content or {Token}"
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {["{FullName}", "{Position}", "{TournamentName}", "{Venue}", "{StartDate}"].map(tok => (
              <button
                key={tok}
                onClick={() => onUpdateElement({ content: te.content + tok } as any)}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-[#d4af37]/30 text-[#d4af37]/70 hover:bg-[#d4af37]/10 transition-colors"
              >
                {tok}
              </button>
            ))}
          </div>
        </Section>
        <Section title="Typography">
          <Row label="Font">
            <select
              value={te.fontFamily}
              onChange={e => onUpdateElement({ fontFamily: e.target.value } as any)}
              className="w-full h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none"
            >
              {FONT_FAMILIES.map(f => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f.split(",")[0]}</option>
              ))}
            </select>
          </Row>
          <Row label="Size">
            <NumInput value={te.fontSize} onChange={v => onUpdateElement({ fontSize: v } as any)} min={6} max={120} unit="px" />
          </Row>
          <Row label="Weight">
            <select
              value={te.fontWeight}
              onChange={e => onUpdateElement({ fontWeight: e.target.value as any } as any)}
              className="w-full h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none"
            >
              {["normal", "600", "700", "800", "900"].map(w => (
                <option key={w} value={w}>{w === "normal" ? "Regular" : w}</option>
              ))}
            </select>
          </Row>
          <Row label="Style">
            <div className="flex gap-1">
              <button
                onClick={() => onUpdateElement({ fontStyle: te.fontStyle === "italic" ? "normal" : "italic" } as any)}
                className={`flex-1 h-7 rounded text-xs transition-colors ${te.fontStyle === "italic" ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}
              >
                <em>I</em>talics
              </button>
              <button
                onClick={() => onUpdateElement({ textDecoration: te.textDecoration === "underline" ? "none" : "underline" } as any)}
                className={`flex-1 h-7 rounded text-xs transition-colors ${te.textDecoration === "underline" ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}
              >
                <u>U</u>nder
              </button>
            </div>
          </Row>
          <Row label="Align">
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map(a => (
                <button
                  key={a}
                  onClick={() => onUpdateElement({ textAlign: a } as any)}
                  className={`flex-1 h-7 rounded flex items-center justify-center transition-colors ${te.textAlign === a ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40" : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"}`}
                >
                  {a === "left" ? <AlignLeft size={12} /> : a === "center" ? <AlignCenter size={12} /> : <AlignRight size={12} />}
                </button>
              ))}
            </div>
          </Row>
          <Row label="Color">
            <ColorInput value={te.color} onChange={c => onUpdateElement({ color: c } as any)} />
          </Row>
          <Row label="Bg Color">
            <ColorInput value={te.backgroundColor} onChange={c => onUpdateElement({ backgroundColor: c } as any)} />
          </Row>
          <Row label="Spacing">
            <NumInput value={te.letterSpacing} onChange={v => onUpdateElement({ letterSpacing: v } as any)} step={0.01} unit="em" />
          </Row>
          <Row label="Line Ht">
            <NumInput value={te.lineHeight} onChange={v => onUpdateElement({ lineHeight: v } as any)} step={0.1} min={1} />
          </Row>
          <Row label="Padding">
            <NumInput value={te.padding} onChange={v => onUpdateElement({ padding: v } as any)} min={0} unit="px" />
          </Row>
        </Section>
        {posSection}
        <ActionsSection onDelete={onDeleteElement} onDuplicate={onDuplicateElement} />
      </div>
    )
  }

  // ── Divider
  if (el.type === "divider") {
    const de = el as DividerElement
    return (
      <div>
        <Section title="Divider Style">
          <Row label="Color">
            <ColorInput value={de.stroke} onChange={c => onUpdateElement({ stroke: c } as any)} />
          </Row>
          <Row label="Thickness">
            <NumInput value={de.strokeWidth} onChange={v => onUpdateElement({ strokeWidth: v } as any)} min={0.5} max={20} step={0.5} unit="px" />
          </Row>
          <Row label="Style">
            <select
              value={de.style}
              onChange={e => onUpdateElement({ style: e.target.value as any } as any)}
              className="w-full h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </Row>
        </Section>
        {posSection}
        <ActionsSection onDelete={onDeleteElement} onDuplicate={onDuplicateElement} />
      </div>
    )
  }

  // ── Rectangle / Ellipse
  if (el.type === "rectangle" || el.type === "ellipse") {
    const se = el as ShapeElement
    return (
      <div>
        <Section title="Shape Style">
          <Row label="Fill">
            <ColorInput value={se.fill} onChange={c => onUpdateElement({ fill: c } as any)} />
          </Row>
          <Row label="Stroke">
            <ColorInput value={se.stroke} onChange={c => onUpdateElement({ stroke: c } as any)} />
          </Row>
          <Row label="Str Width">
            <NumInput value={se.strokeWidth} onChange={v => onUpdateElement({ strokeWidth: v } as any)} min={0} max={20} step={0.5} unit="px" />
          </Row>
          {el.type === "rectangle" && (
            <Row label="Radius">
              <NumInput value={se.borderRadius} onChange={v => onUpdateElement({ borderRadius: v } as any)} min={0} max={200} unit="px" />
            </Row>
          )}
        </Section>
        {posSection}
        <ActionsSection onDelete={onDeleteElement} onDuplicate={onDuplicateElement} />
      </div>
    )
  }

  // ── Logo elements
  if (el.type === "logo_organizer" || el.type === "logo_sponsor") {
    const le = el as LogoElement
    return (
      <div>
        <Section title="Logo">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = ev => onUpdateElement({ src: ev.target?.result as string } as any)
              reader.readAsDataURL(file)
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-9 rounded border border-dashed border-white/20 text-xs text-white/40 hover:border-white/40 hover:text-white/60 transition-colors"
          >
            {le.src ? "Replace Image" : "Upload Image"}
          </button>
          {le.src && (
            <button
              onClick={() => onUpdateElement({ src: null } as any)}
              className="w-full text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
            >
              Remove image
            </button>
          )}
          <Row label="Label">
            <input
              type="text"
              value={le.label}
              onChange={e => onUpdateElement({ label: e.target.value } as any)}
              className="w-full h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none"
            />
          </Row>
          <Row label="Fit">
            <select
              value={le.objectFit}
              onChange={e => onUpdateElement({ objectFit: e.target.value as any } as any)}
              className="w-full h-7 rounded px-2 text-xs bg-white/5 border border-white/10 text-white/80 focus:outline-none"
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
            </select>
          </Row>
        </Section>
        {posSection}
        <ActionsSection onDelete={onDeleteElement} onDuplicate={onDuplicateElement} />
      </div>
    )
  }

  return null
}

function ActionsSection({ onDelete, onDuplicate }: { onDelete: () => void; onDuplicate: () => void }) {
  return (
    <div className="px-4 py-3 flex gap-2">
      <button
        onClick={onDuplicate}
        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded border border-white/10 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Copy size={12} /> Duplicate
      </button>
      <button
        onClick={onDelete}
        className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded border border-red-500/20 text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={12} /> Delete
      </button>
    </div>
  )
}
