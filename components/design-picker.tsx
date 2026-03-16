"use client"

import { useState, useMemo, useEffect } from "react"
import { CERTIFICATE_DESIGNS } from "@/lib/certificate-designs"
import { CertificateThumbnail, CustomTemplateRenderer } from "./certificate-renderer"
import { Palette, LayoutGrid, SlidersHorizontal, Check, Plus, Layers } from "lucide-react"
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

const DEFAULT_PARTICIPANT: Participant = {
  name: "Priya Sharma", title: "Ms.", position: "1", category: "Open",
  points: "8.5", gender: "Female", affiliation: "", rounds: "11",
}
const DEFAULT_EVENT: EventData = {
  tournamentName: "My Tournament", venue: "Chess Club",
  startDate: "2025-01-01", endDate: "2025-01-02", totalRounds: "9", isSingleDay: false,
}

export function DesignPicker({
  selectedDesign, onSelect,
  customColors, onCustomColorsChange,
  selectedCustomTemplateId, onSelectCustomTemplate,
  previewParticipant, previewEvent,
}: DesignPickerProps) {
  const [tab, setTab] = useState<"default" | "saved">("default")
  const [showColors, setShowColors] = useState(false)
  const [filter, setFilter] = useState("all")
  const [customTemplates, setCustomTemplates] = useState<CertificateTemplate[]>([])

  const thumbParticipant = previewParticipant || DEFAULT_PARTICIPANT
  const thumbEvent = previewEvent || DEFAULT_EVENT

  // Load saved templates and keep in sync with localStorage
  useEffect(() => {
    const refresh = () => setCustomTemplates(loadTemplates())
    refresh()

    // Poll every 2s — most reliable way to catch same-tab saves regardless of events
    const poll = setInterval(refresh, 2000)

    // Event-based triggers as well for instant updates
    const onFocus = () => refresh()
    const onVisibility = () => { if (!document.hidden) refresh() }
    const onStorage = (e: StorageEvent) => {
      if (e.key === "certify_custom_templates" || e.key === "certify-templates-updated") refresh()
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("storage", onStorage)
    return () => {
      clearInterval(poll)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  // Switch to saved tab automatically when a template is saved
  useEffect(() => {
    if (customTemplates.length > 0 && selectedCustomTemplateId) {
      setTab("saved")
    }
  }, [customTemplates.length, selectedCustomTemplateId])

  const filteredDesigns = useMemo(() => {
    if (filter === "all") return CERTIFICATE_DESIGNS
    return CERTIFICATE_DESIGNS.filter(d => d.category === filter)
  }, [filter])

  const currentDesign = CERTIFICATE_DESIGNS.find(d => d.id === selectedDesign) || CERTIFICATE_DESIGNS[0]

  const colorFields = [
    { key: "borderColor", label: "Border", defaultVal: currentDesign.borderColor },
    { key: "bgColor", label: "Background", defaultVal: currentDesign.bgColor },
    { key: "accentColor", label: "Accent", defaultVal: currentDesign.accentColor },
    { key: "headerColor", label: "Header", defaultVal: currentDesign.headerColor },
    { key: "textColor", label: "Body", defaultVal: currentDesign.textColor },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          Certificate Designs
        </h3>
        <button
          onClick={() => window.open("/editor", "_blank", "noopener,noreferrer")}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground border border-border hover:border-[#d4af37]/60 rounded px-2 py-1 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Create Custom
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("default")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            tab === "default"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Default Templates
          <span className="ml-1 text-[10px] bg-secondary rounded-full px-1.5 py-0.5">{CERTIFICATE_DESIGNS.length}</span>
        </button>
        <button
          onClick={() => setTab("saved")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            tab === "saved"
              ? "border-[#d4af37] text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Saved Templates
          {customTemplates.length > 0 && (
            <span className="ml-1 text-[10px] bg-[#d4af37]/20 text-[#d4af37] rounded-full px-1.5 py-0.5">{customTemplates.length}</span>
          )}
        </button>
      </div>

      {/* Default Templates Tab */}
      {tab === "default" && (
        <div className="space-y-3">
          {/* Category filters */}
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
                isSelected={!selectedCustomTemplateId && selectedDesign === design.id}
                onClick={() => {
                  onSelect(design.id)
                  onSelectCustomTemplate?.(null)
                  onCustomColorsChange?.({})
                }}
              />
            ))}
          </div>

          {/* Selected design info */}
          {!selectedCustomTemplateId && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-md shrink-0" style={{ backgroundColor: currentDesign.accentColor + "20" }}>
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: currentDesign.accentColor }} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{currentDesign.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentDesign.category}</p>
              </div>
            </div>
          )}

          {/* Color customization */}
          {onCustomColorsChange && (
            <div className="border-t border-border pt-3">
              <button
                onClick={() => setShowColors(!showColors)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors w-full"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Customize Colors</span>
                <Palette className={`h-3.5 w-3.5 ml-auto transition-transform ${showColors ? "rotate-180" : ""}`} />
              </button>
              {showColors && (
                <div className="mt-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="grid grid-cols-5 gap-4">
                    {colorFields.map((cf) => (
                      <div key={cf.key} className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground text-center">{cf.label}</span>
                        <input
                          type="color"
                          value={customColors?.[cf.key] || cf.defaultVal}
                          onChange={(e) => onCustomColorsChange({ ...customColors, [cf.key]: e.target.value })}
                          className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border hover:border-primary transition-colors"
                        />
                        <span className="text-[9px] font-mono text-muted-foreground">
                          {(customColors?.[cf.key] || cf.defaultVal).toUpperCase()}
                        </span>
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
      )}

      {/* Saved Templates Tab */}
      {tab === "saved" && (
        <div className="space-y-3">
          {customTemplates.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No saved templates yet.</p>
              <p className="text-xs text-muted-foreground">Use the editor to create and save a custom template.</p>
              <button
                onClick={() => window.open("/editor", "_blank", "noopener,noreferrer")}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#d4af37] text-[#1a1a2e] text-xs font-semibold hover:bg-[#c49b2d] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Open Editor
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Select a saved template to use it as your certificate layout.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[480px] overflow-y-auto pr-1">
                {customTemplates.map(t => {
                  const isSelected = selectedCustomTemplateId === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectCustomTemplate?.(isSelected ? null : t.id)
                        if (!isSelected) onSelect(selectedDesign)
                      }}
                      className="flex flex-col items-start gap-2 group text-left"
                    >
                      {/* Thumbnail */}
                      <div style={{
                        width: "100%", paddingBottom: "70.75%", position: "relative",
                        overflow: "hidden", borderRadius: 8,
                        outline: isSelected ? "2.5px solid #d4af37" : "1.5px solid hsl(var(--border))",
                        boxShadow: isSelected ? "0 0 0 3px #d4af3730" : "0 1px 4px rgba(0,0,0,0.08)",
                        transition: "all 0.15s",
                      }}>
                        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                          <div style={{
                            transform: `scale(${160 / 800})`,
                            transformOrigin: "top left",
                            width: 800, height: 566,
                            pointerEvents: "none",
                          }}>
                            <CustomTemplateRenderer
                              template={t}
                              participant={thumbParticipant}
                              event={thumbEvent}
                              scale={1}
                            />
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#d4af37] flex items-center justify-center z-10">
                            <Check className="h-3 w-3 text-[#1a1a2e]" />
                          </div>
                        )}
                      </div>
                      {/* Name */}
                      <div className="w-full px-0.5">
                        <p className={`text-xs font-semibold truncate transition-colors ${isSelected ? "text-[#d4af37]" : "text-foreground group-hover:text-foreground"}`}>
                          {t.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{t.elements.length} elements</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedCustomTemplateId && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-[#d4af37]/8 border border-[#d4af37]/25">
                  <Check className="h-3.5 w-3.5 text-[#d4af37] shrink-0" />
                  <p className="text-[11px] text-[#d4af37]">
                    Custom template active — live preview and certificates will use this layout.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => window.open("/editor", "_blank", "noopener,noreferrer")}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground border border-border hover:border-[#d4af37]/60 rounded px-2 py-1 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Create another
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
