"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  CertificateTemplate, TemplateElement, blankTemplate, loadTemplates,
  upsertTemplate, deleteTemplate, genId, CANVAS_W, CANVAS_H,
  defaultTextElement, defaultHeadingElement, defaultDivider,
  defaultRectangle, defaultEllipse, defaultLogoElement,
  TextElement, ShapeElement, DividerElement, LogoElement,
} from "@/lib/template-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditorCanvas } from "@/components/editor/editor-canvas"
import { ElementsPanel } from "@/components/editor/elements-panel"
import { PropertiesPanel } from "@/components/editor/properties-panel"
import {
  ChevronLeft, Save, Download, RotateCcw, RotateCw,
  Trash2, Eye, EyeOff, Copy, Plus, Layers, Settings2, Check, FileText,
} from "lucide-react"

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [template, setTemplate] = useState<CertificateTemplate | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [undoStack, setUndoStack] = useState<CertificateTemplate[]>([])
  const [redoStack, setRedoStack] = useState<CertificateTemplate[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [editingName, setEditingName] = useState(false)
  const [allTemplates, setAllTemplates] = useState<CertificateTemplate[]>([])
  const [leftPanel, setLeftPanel] = useState<"elements" | "templates">("elements")
  
  // Refresh templates when switching to templates panel
  const switchToTemplatesPanel = useCallback(() => {
    const templates = loadTemplates()
    console.log("[v0] Switching to templates panel - count:", templates.length, templates.map(t => t.name))
    setAllTemplates(templates)
    setLeftPanel("templates")
  }, [])
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Load template on mount
  useEffect(() => {
    const id = searchParams?.get("id")
    const templates = loadTemplates()
    console.log("[v0] Initial load - templates count:", templates.length, templates.map(t => t.name))
    setAllTemplates(templates)
    if (id) {
      const found = templates.find(t => t.id === id)
      if (found) { setTemplate(found); return }
    }
    // New blank
    setTemplate(blankTemplate())
  }, [searchParams])

  // Auto-fit zoom to viewport
  useEffect(() => {
    const available = window.innerWidth - 280 - 320 - 40
    setZoom(Math.min(1, available / CANVAS_W))
  }, [])

  // ── History helpers
  const pushHistory = useCallback((prev: CertificateTemplate) => {
    setUndoStack(s => [...s.slice(-30), prev])
    setRedoStack([])
    setIsSaved(false)
  }, [])

  const undo = useCallback(() => {
    if (!template || undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack(s => [template, ...s.slice(0, 30)])
    setUndoStack(s => s.slice(0, -1))
    setTemplate(prev)
  }, [template, undoStack])

  const redo = useCallback(() => {
    if (!template || redoStack.length === 0) return
    const next = redoStack[0]
    setUndoStack(s => [...s, template])
    setRedoStack(s => s.slice(1))
    setTemplate(next)
  }, [template, redoStack])

  // ── Template mutation helper
  const mutate = useCallback((updater: (t: CertificateTemplate) => CertificateTemplate) => {
    setTemplate(prev => {
      if (!prev) return prev
      pushHistory(prev)
      return { ...updater(prev), updatedAt: new Date().toISOString() }
    })
  }, [pushHistory])

  // ── Element operations
  const updateElement = useCallback((id: string, patch: Partial<TemplateElement>) => {
    mutate(t => ({
      ...t,
      elements: t.elements.map(el => el.id === id ? { ...el, ...patch } as TemplateElement : el),
    }))
  }, [mutate])

  const addElement = useCallback((el: TemplateElement | TemplateElement[]) => {
    const els = Array.isArray(el) ? el : [el]
    mutate(t => ({ ...t, elements: [...t.elements, ...els] }))
    setSelectedId(els[els.length - 1].id)
  }, [mutate])

  const duplicateElement = useCallback((id: string) => {
    if (!template) return
    const el = template.elements.find(e => e.id === id)
    if (!el) return
    const newEl = { ...el, id: genId(), x: el.x + 16, y: el.y + 16, zIndex: el.zIndex + 1 }
    mutate(t => ({ ...t, elements: [...t.elements, newEl as TemplateElement] }))
    setSelectedId(newEl.id)
  }, [template, mutate])

  const removeElement = useCallback((id: string) => {
    // Always allow deletion — ignore locked flag, user explicitly clicked delete
    mutate(t => ({ ...t, elements: t.elements.filter(e => e.id !== id) }))
    setSelectedId(prev => prev === id ? null : prev)
  }, [mutate])

  const reorderElements = useCallback((elements: TemplateElement[]) => {
    mutate(t => ({ ...t, elements }))
  }, [mutate])

  // ── Save
  const save = useCallback(() => {
    if (!template) return
    console.log("[v0] Saving template:", template.id, template.name)
    upsertTemplate(template)
    const updatedTemplates = loadTemplates()
    console.log("[v0] Loaded templates after save:", updatedTemplates.length, updatedTemplates.map(t => t.name))
    setAllTemplates(updatedTemplates)
    // Write a marker key so storage event fires on other tabs
    try { localStorage.setItem("certify-templates-updated", String(Date.now())) } catch { /* noop */ }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }, [template])

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "certify_custom_templates" || e.key === "certify-templates-updated") {
        setAllTemplates(loadTemplates())
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Keyboard shortcuts — attached to window so they fire regardless of focus target
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const tag = (e.target as HTMLElement).tagName
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable

      if (mod && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo() }
      if (mod && e.key === "s") { e.preventDefault(); save() }
      if (mod && e.key === "d" && selectedId) { e.preventDefault(); duplicateElement(selectedId) }

      // Delete / Backspace — works when not typing in an input
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !isInput) {
        e.preventDefault()
        removeElement(selectedId)
      }

      if (e.key === "Escape") setSelectedId(null)

      // Arrow key nudge
      if (selectedId && ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key) && !isInput) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const el = template?.elements.find(x => x.id === selectedId)
        if (!el) return
        if (e.key === "ArrowLeft") updateElement(selectedId, { x: Math.max(0, el.x - step) })
        if (e.key === "ArrowRight") updateElement(selectedId, { x: Math.min(CANVAS_W - el.width, el.x + step) })
        if (e.key === "ArrowUp") updateElement(selectedId, { y: Math.max(0, el.y - step) })
        if (e.key === "ArrowDown") updateElement(selectedId, { y: Math.min(CANVAS_H - el.height, el.y + step) })
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo, save, duplicateElement, removeElement, updateElement, selectedId, template])

  const selectedEl = template?.elements.find(e => e.id === selectedId) ?? null

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1a2e]">
        <div className="text-white/50 text-sm">Loading editor…</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#111827] overflow-hidden" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* ── Top toolbar ── */}
      <header className="flex items-center gap-3 px-4 h-14 bg-[#1f2937] border-b border-white/10 shrink-0 z-20">
        {/* Back */}
        <Button
          variant="ghost" size="sm"
          onClick={() => {
            // Editor opens in a new tab — close it; fall back to router if same tab
            if (window.history.length <= 1 || window.opener) {
              window.close()
            } else {
              router.back()
            }
          }}
          className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="w-px h-5 bg-white/10" />

        {/* Template name */}
        {editingName ? (
          <Input
            ref={nameInputRef}
            value={template.name}
            onChange={e => setTemplate(prev => prev ? { ...prev, name: e.target.value } : prev)}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => { if (e.key === "Enter") setEditingName(false) }}
            className="h-8 w-56 bg-white/10 border-white/20 text-white text-sm focus-visible:ring-[#d4af37]"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm font-semibold text-white hover:text-[#d4af37] transition-colors px-2 py-1 rounded hover:bg-white/5"
          >
            {template.name}
          </button>
        )}

        <div className="flex-1" />

        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo (Ctrl+Z)"
          className="flex h-8 w-8 items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Y)"
          className="flex h-8 w-8 items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-white/10" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(1)))}
            className="flex h-7 w-7 items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 text-lg leading-none"
          >−</button>
          <span className="text-xs text-white/50 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
            className="flex h-7 w-7 items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 text-lg leading-none"
          >+</button>
        </div>

        <div className="w-px h-5 bg-white/10" />

        {/* Save */}
        <Button
          size="sm"
          onClick={save}
          className={`gap-1.5 transition-all ${isSaved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-[#d4af37] hover:bg-[#c49b2d] text-[#1a1a2e]"}`}
        >
          {isSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {isSaved ? "Saved" : "Save Template"}
        </Button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Left panel ── */}
        <aside className="w-[280px] shrink-0 bg-[#1f2937] border-r border-white/10 flex flex-col">
          {/* Panel tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setLeftPanel("elements")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
                leftPanel === "elements" ? "text-[#d4af37] border-b-2 border-[#d4af37]" : "text-white/40 hover:text-white/70"
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> Add Elements
            </button>
            <button
              onClick={switchToTemplatesPanel}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
                leftPanel === "templates" ? "text-[#d4af37] border-b-2 border-[#d4af37]" : "text-white/40 hover:text-white/70"
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> My Templates
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {leftPanel === "elements" ? (
              <ElementsPanel
                template={template}
                selectedId={selectedId}
                onSelectElement={setSelectedId}
                onAddElement={addElement}
                onRemoveElement={removeElement}
                onDuplicateElement={duplicateElement}
                onReorderElements={reorderElements}
                onToggleVisibility={(id) => {
                  const el = template.elements.find(e => e.id === id)
                  if (el) updateElement(id, { visible: !el.visible })
                }}
                onToggleLock={(id) => {
                  const el = template.elements.find(e => e.id === id)
                  if (el) updateElement(id, { locked: !el.locked })
                }}
              />
            ) : (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/40 font-semibold uppercase tracking-widest">Saved Templates</p>
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded">{allTemplates.length}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 border-[#d4af37]/30 text-[#d4af37]/80 hover:text-[#d4af37] hover:bg-[#d4af37]/10 hover:border-[#d4af37]/50"
                  onClick={() => {
                    const t = blankTemplate()
                    setTemplate(t)
                    setSelectedId(null)
                    setUndoStack([])
                    setRedoStack([])
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> New Blank Template
                </Button>
                {allTemplates.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <Layers className="h-5 w-5 text-white/20" />
                    </div>
                    <p className="text-xs text-white/40 mb-1">No saved templates yet</p>
                    <p className="text-[10px] text-white/25">Save this template to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allTemplates.map(t => (
                      <div key={t.id} className={`group relative rounded-lg border p-3 cursor-pointer transition-all ${
                        template.id === t.id 
                          ? "border-[#d4af37]/60 bg-[#d4af37]/10 ring-1 ring-[#d4af37]/20" 
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}>
                        <button className="w-full text-left" onClick={() => {
                          setTemplate(t)
                          setSelectedId(null)
                          setUndoStack([])
                          setRedoStack([])
                        }}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${template.id === t.id ? "bg-[#d4af37]" : "bg-white/20"}`} />
                            <p className="text-sm font-semibold text-white/80 truncate flex-1">{t.name}</p>
                          </div>
                          <p className="text-xs text-white/30 mt-1 ml-4">
                            {t.elements.length} elements
                            <span className="mx-1.5">·</span>
                            {new Date(t.updatedAt).toLocaleDateString()}
                          </p>
                        </button>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Duplicate template
                              const dup = { ...t, id: genId(), name: `${t.name} (Copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                              upsertTemplate(dup)
                              setAllTemplates(loadTemplates())
                            }}
                            className="p-1 text-white/30 hover:text-white/60 hover:bg-white/10 rounded transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); setAllTemplates(loadTemplates()) }}
                            className="p-1 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ── Canvas area ── */}
        <main className="flex-1 min-w-0 bg-[#0d1117] overflow-auto">
          <div className="flex items-start justify-center p-10 min-h-full min-w-max">
            <EditorCanvas
              template={template}
              selectedId={selectedId}
              zoom={zoom}
              onSelectElement={setSelectedId}
              onUpdateElement={updateElement}
              onDeselectAll={() => setSelectedId(null)}
              onUpdateBackground={(bg) => mutate(t => ({ ...t, background: { ...t.background, ...bg } }))}
            />
          </div>
        </main>

        {/* ── Right panel ── */}
        <aside className="w-[300px] shrink-0 bg-[#1f2937] border-l border-white/10 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <Settings2 className="h-4 w-4 text-[#d4af37]" />
            <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">
              {selectedEl ? "Element Properties" : "Canvas Properties"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PropertiesPanel
              template={template}
              selectedElement={selectedEl}
              onUpdateElement={(patch) => selectedEl && updateElement(selectedEl.id, patch)}
              onUpdateBackground={(bg) => mutate(t => ({ ...t, background: { ...t.background, ...bg } }))}
              onDeleteElement={() => selectedEl && removeElement(selectedEl.id)}
              onDuplicateElement={() => selectedEl && duplicateElement(selectedEl.id)}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
