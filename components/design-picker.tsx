"use client"

import { useState, useMemo, useEffect } from "react"
import { CERTIFICATE_DESIGNS } from "@/lib/certificate-designs"
import { CertificateThumbnail } from "./certificate-renderer"
import { Label } from "@/components/ui/label"
import { Palette, LayoutGrid, SlidersHorizontal, ExternalLink, Check } from "lucide-react"
import { loadTemplates, CertificateTemplate } from "@/lib/template-editor"

interface DesignPickerProps {
  selectedDesign: number
  onSelect: (id: number) => void
  customColors?: Record<string, string>
  onCustomColorsChange?: (colors: Record<string, string>) => void
  selectedCustomTemplateId?: string | null
  onSelectCustomTemplate?: (id: string | null) => void
}

const CATEGORY_FILTERS = [
  { value: "all", label: "All 20" },
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "premium", label: "Premium" },
  { value: "playful", label: "Playful" },
  { value: "institutional", label: "Institutional" },
]

export function DesignPicker({ selectedDesign, onSelect, customColors, onCustomColorsChange, selectedCustomTemplateId, onSelectCustomTemplate }: DesignPickerProps) {
  const [showColors, setShowColors] = useState(false)
  const [filter, setFilter] = useState("all")
  const [customTemplates, setCustomTemplates] = useState<CertificateTemplate[]>([])
  const currentDesign = CERTIFICATE_DESIGNS.find(d => d.id === selectedDesign) || CERTIFICATE_DESIGNS[0]

  useEffect(() => {
    setCustomTemplates(loadTemplates())
    // Refresh on focus (user may have just saved in editor)
    const onFocus = () => setCustomTemplates(loadTemplates())
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  const filteredDesigns = useMemo(() => {
    if (filter === "all") return CERTIFICATE_DESIGNS
    return CERTIFICATE_DESIGNS.filter(d => d.category === filter)
  }, [filter])

  const colorFields = [
    { key: "borderColor", label: "Border", defaultVal: currentDesign.borderColor },
    { key: "bgColor", label: "Background", defaultVal: currentDesign.bgColor },
    { key: "accentColor", label: "Accent", defaultVal: currentDesign.accentColor },
    { key: "headerColor", label: "Header", defaultVal: currentDesign.headerColor },
    { key: "textColor", label: "Body", defaultVal: currentDesign.textColor },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          Certificate Designs
        </h3>
        <span className="text-xs text-muted-foreground">{filteredDesigns.length} designs</span>
      </div>

      {/* Custom templates from editor */}
      {customTemplates.length > 0 && (
        <div className="rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#d4af37] flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              My Custom Templates ({customTemplates.length})
            </p>
            <button
              onClick={() => window.open("/editor", "_blank", "noopener,noreferrer")}
              className="text-[10px] text-[#d4af37]/70 hover:text-[#d4af37] flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="h-3 w-3" /> Open Editor
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {customTemplates.map(t => (
              <button
                key={t.id}
                onClick={() => onSelectCustomTemplate?.(selectedCustomTemplateId === t.id ? null : t.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCustomTemplateId === t.id
                    ? "bg-[#d4af37] text-[#1a1a2e]"
                    : "bg-white/50 border border-[#d4af37]/20 text-foreground hover:bg-[#d4af37]/10"
                }`}
              >
                {selectedCustomTemplateId === t.id && <Check className="h-3 w-3" />}
                {t.name}
              </button>
            ))}
          </div>
          {selectedCustomTemplateId && (
            <p className="text-[10px] text-[#d4af37]/70">Custom template selected — the live preview will use this layout.</p>
          )}
        </div>
      )}

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Design grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {filteredDesigns.map((design) => (
          <CertificateThumbnail
            key={design.id}
            designId={design.id}
            colors={customColors}
            isSelected={selectedDesign === design.id}
            onClick={() => {
              onSelect(design.id)
              onCustomColorsChange?.({})
            }}
          />
        ))}
      </div>

      {/* Selected info */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-md shrink-0" style={{ backgroundColor: currentDesign.accentColor + "20" }}>
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: currentDesign.accentColor }} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{currentDesign.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{currentDesign.category}</p>
        </div>
      </div>

      {/* Color Customization */}
      {onCustomColorsChange && (
        <div className="border-t border-border pt-3">
          <button onClick={() => setShowColors(!showColors)} className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors w-full">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Customize Colors</span>
            <Palette className={`h-3.5 w-3.5 ml-auto transition-transform ${showColors ? "rotate-180" : ""}`} />
          </button>
          {showColors && (
            <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="grid grid-cols-5 gap-4">
                {colorFields.map((cf) => (
                  <div key={cf.key} className="flex flex-col items-center gap-1.5">
                    <Label className="text-[10px] text-muted-foreground text-center">{cf.label}</Label>
                    <input
                      type="color"
                      value={customColors?.[cf.key] || cf.defaultVal}
                      onChange={(e) => onCustomColorsChange({ ...customColors, [cf.key]: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border hover:border-primary transition-colors"
                    />
                    <span className="text-[9px] font-mono text-muted-foreground">{(customColors?.[cf.key] || cf.defaultVal).toUpperCase()}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => onCustomColorsChange({})} className="mt-3 text-xs text-primary hover:underline">
                Reset to defaults
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
