"use client"

import { useState, useMemo, useEffect } from "react"
import { CERTIFICATE_DESIGNS } from "@/lib/certificate-designs"
import { CertificateThumbnail, CustomTemplateRenderer } from "./certificate-renderer"
import { Label } from "@/components/ui/label"
import { Palette, LayoutGrid, SlidersHorizontal, ExternalLink, Check, Plus } from "lucide-react"
import { loadTemplates, CertificateTemplate } from "@/lib/template-editor"
import type { Participant } from "@/lib/csv-fields"
import type { EventData } from "@/lib/certificate-wording"

interface DesignPickerProps {
  selectedDesign: number
  onSelect: (id: number) => void
  customColors?: Record<string, string>
  onCustomColorsChange?: (colors: Record<string, string>) => void
  selectedCustomTemplateId?: string | null
  onSelectCustomTemplate?: (id: string | null) => void
  previewParticipant?: Participant
  previewEvent?: EventData
}

const CATEGORY_FILTERS = [
  { value: "all", label: "All 20" },
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "premium", label: "Premium" },
  { value: "playful", label: "Playful" },
  { value: "institutional", label: "Institutional" },
]

export function DesignPicker({ selectedDesign, onSelect, customColors, onCustomColorsChange, selectedCustomTemplateId, onSelectCustomTemplate, previewParticipant, previewEvent }: DesignPickerProps) {
  const [showColors, setShowColors] = useState(false)
  const [filter, setFilter] = useState("all")
  const [customTemplates, setCustomTemplates] = useState<CertificateTemplate[]>([])
  const currentDesign = CERTIFICATE_DESIGNS.find(d => d.id === selectedDesign) || CERTIFICATE_DESIGNS[0]

  const defaultParticipant: Participant = { name: "Priya Sharma", title: "Ms.", position: "1", category: "Open", points: "8.5", gender: "Female", affiliation: "", rounds: "11" }
  const defaultEvent: EventData = { tournamentName: "My Tournament", venue: "Chess Club", startDate: "2025-01-01", endDate: "2025-01-02", totalRounds: "9", isSingleDay: false }
  const thumbParticipant = previewParticipant || defaultParticipant
  const thumbEvent = previewEvent || defaultEvent

  useEffect(() => {
    const refresh = () => setCustomTemplates(loadTemplates())
    refresh()
    // fires when user returns to this tab from same-tab navigation
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh() })
    // fires when another tab (editor) saves to localStorage
    window.addEventListener("storage", (e) => { if (e.key === "certify-templates-updated" || e.key === "certify-templates") refresh() })
    return () => {
      window.removeEventListener("focus", refresh)
      window.removeEventListener("storage", refresh as any)
    }
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-[#d4af37]" />
              My Templates ({customTemplates.length})
            </p>
            <button
              onClick={() => window.open("/editor", "_blank", "noopener,noreferrer")}
              className="text-[10px] text-muted-foreground hover:text-[#d4af37] flex items-center gap-1 transition-colors"
            >
              <Plus className="h-3 w-3" /> New in Editor
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-1">
            {customTemplates.map(t => {
              const isSelected = selectedCustomTemplateId === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectCustomTemplate?.(isSelected ? null : t.id)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div style={{
                    width: 130, height: 92,
                    position: "relative", overflow: "hidden",
                    borderRadius: 6,
                    outline: isSelected ? `2.5px solid #d4af37` : `1.5px solid #d4af3730`,
                    boxShadow: isSelected ? `0 0 0 3px #d4af3730` : "0 1px 4px rgba(0,0,0,0.10)",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ transform: `scale(${130/800})`, transformOrigin: "top left", width: 800, height: 566, pointerEvents: "none" }}>
                      <CustomTemplateRenderer
                        template={t}
                        participant={thumbParticipant}
                        event={thumbEvent}
                        scale={1}
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d4af37] flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-[#1a1a2e]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-center font-medium leading-tight text-muted-foreground group-hover:text-foreground transition-colors max-w-[130px] truncate">{t.name}</span>
                </button>
              )
            })}
          </div>
          {selectedCustomTemplateId && (
            <p className="text-[10px] text-[#d4af37]/80 bg-[#d4af37]/5 px-2 py-1 rounded border border-[#d4af37]/20">
              Custom template active — live preview and certificates will use this layout
            </p>
          )}
          <div className="border-t border-border my-1" />
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
