"use client"

import { useRef, useCallback, useEffect } from "react"
import {
  CertificateTemplate, TemplateElement, CanvasBackground,
  TextElement, ShapeElement, DividerElement, LogoElement, ImageElement,
  CANVAS_W, CANVAS_H,
} from "@/lib/template-editor"

interface EditorCanvasProps {
  template: CertificateTemplate
  selectedId: string | null
  zoom: number
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, patch: Partial<TemplateElement>) => void
  onDeselectAll: () => void
  onUpdateBackground: (bg: Partial<CanvasBackground>) => void
}

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"
const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]
const HANDLE_POS: Record<Handle, { cx: number; cy: number }> = {
  nw: { cx: 0, cy: 0 }, n: { cx: 0.5, cy: 0 }, ne: { cx: 1, cy: 0 },
  e:  { cx: 1, cy: 0.5 }, se: { cx: 1, cy: 1 }, s: { cx: 0.5, cy: 1 },
  sw: { cx: 0, cy: 1 }, w: { cx: 0, cy: 0.5 },
}
const CURSOR_MAP: Record<Handle, string> = {
  nw: "nw-resize", n: "n-resize", ne: "ne-resize", e: "e-resize",
  se: "se-resize", s: "s-resize", sw: "sw-resize", w: "w-resize",
}

function resolveToken(content: string): string {
  return content
    .replace(/\{FullName\}/g, "Ms. Priya Sharma")
    .replace(/\{Name\}/g, "Priya Sharma")
    .replace(/\{Title\}/g, "Ms.")
    .replace(/\{Position\}/g, "1st")
    .replace(/\{Category\}/g, "Open U-18")
    .replace(/\{Points\}/g, "8.5")
    .replace(/\{TournamentName\}/g, "National Chess Championship 2025")
    .replace(/\{Venue\}/g, "Olympic Stadium, Mumbai")
    .replace(/\{StartDate\}/g, "01 Jan 2025")
    .replace(/\{EndDate\}/g, "05 Jan 2025")
    .replace(/\{Rounds\}/g, "11")
}

export function EditorCanvas({
  template, selectedId, zoom,
  onSelectElement, onUpdateElement, onDeselectAll,
}: EditorCanvasProps) {
  // Stable container ref — pointer capture attaches here, never unmounts
  const containerRef = useRef<HTMLDivElement>(null)

  // All drag state in a single ref — zero stale closures
  const state = useRef<{
    dragging: boolean
    mode: "move" | "resize" | null
    id: string | null
    handle: Handle | null
    startClientX: number
    startClientY: number
    origX: number; origY: number; origW: number; origH: number
  }>({
    dragging: false, mode: null, id: null, handle: null,
    startClientX: 0, startClientY: 0,
    origX: 0, origY: 0, origW: 0, origH: 0,
  })

  // Always-fresh refs for callback and zoom
  const updateRef = useRef(onUpdateElement)
  useEffect(() => { updateRef.current = onUpdateElement }, [onUpdateElement])
  const zoomRef = useRef(zoom)
  useEffect(() => { zoomRef.current = zoom }, [zoom])

  // Attach ONE global pointermove + pointerup on the container (not window)
  // so that capture works without re-mounting element nodes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function onMove(e: PointerEvent) {
      const s = state.current
      if (!s.dragging || !s.id) return
      const z = zoomRef.current
      const dx = (e.clientX - s.startClientX) / z
      const dy = (e.clientY - s.startClientY) / z

      if (s.mode === "move") {
        const nx = Math.max(0, Math.min(CANVAS_W - s.origW, s.origX + dx))
        const ny = Math.max(0, Math.min(CANVAS_H - s.origH, s.origY + dy))
        updateRef.current(s.id, { x: Math.round(nx), y: Math.round(ny) })
      } else if (s.mode === "resize" && s.handle) {
        const h = s.handle
        let nx = s.origX, ny = s.origY, nw = s.origW, nh = s.origH
        if (h.includes("e")) nw = Math.max(20, s.origW + dx)
        if (h.includes("s")) nh = Math.max(10, s.origH + dy)
        if (h.includes("w")) { nw = Math.max(20, s.origW - dx); nx = s.origX + (s.origW - nw) }
        if (h.includes("n")) { nh = Math.max(10, s.origH - dy); ny = s.origY + (s.origH - nh) }
        updateRef.current(s.id, {
          x: Math.round(nx), y: Math.round(ny),
          width: Math.round(nw), height: Math.round(nh),
        })
      }
    }

    function onUp() {
      state.current.dragging = false
      state.current.mode = null
      state.current.id = null
      // Reset cursor
      if (container) container.style.cursor = "default"
    }

    container.addEventListener("pointermove", onMove)
    container.addEventListener("pointerup", onUp)
    container.addEventListener("pointerleave", onUp)
    return () => {
      container.removeEventListener("pointermove", onMove)
      container.removeEventListener("pointerup", onUp)
      container.removeEventListener("pointerleave", onUp)
    }
  }, []) // empty — uses refs

  const beginMove = useCallback((e: React.PointerEvent, el: TemplateElement) => {
    if (el.locked) return
    e.stopPropagation()
    // Capture on the stable container — survives React re-renders
    containerRef.current?.setPointerCapture(e.pointerId)
    containerRef.current!.style.cursor = "grabbing"
    onSelectElement(el.id)
    state.current = {
      dragging: true, mode: "move", id: el.id, handle: null,
      startClientX: e.clientX, startClientY: e.clientY,
      origX: el.x, origY: el.y, origW: el.width, origH: el.height,
    }
  }, [onSelectElement])

  const beginResize = useCallback((e: React.PointerEvent, el: TemplateElement, handle: Handle) => {
    e.stopPropagation()
    containerRef.current?.setPointerCapture(e.pointerId)
    containerRef.current!.style.cursor = CURSOR_MAP[handle]
    state.current = {
      dragging: true, mode: "resize", id: el.id, handle,
      startClientX: e.clientX, startClientY: e.clientY,
      origX: el.x, origY: el.y, origW: el.width, origH: el.height,
    }
  }, [])

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  function renderElement(el: TemplateElement) {
    if (!el.visible) return null
    const isSelected = selectedId === el.id

    const base: React.CSSProperties = {
      position: "absolute",
      left: el.x, top: el.y,
      width: el.width, height: el.height,
      transform: `rotate(${el.rotation}deg)`,
      opacity: el.opacity / 100,
      cursor: el.locked ? "not-allowed" : "grab",
      userSelect: "none",
      boxSizing: "border-box",
      touchAction: "none",
    }

    let node: React.ReactNode

    if (el.type === "text" || el.type === "heading") {
      const te = el as TextElement
      node = (
        <div
          style={{
            ...base,
            fontFamily: te.fontFamily,
            fontSize: te.fontSize,
            fontWeight: te.fontWeight,
            fontStyle: te.fontStyle,
            color: te.color,
            textAlign: te.textAlign,
            letterSpacing: `${te.letterSpacing}em`,
            lineHeight: te.lineHeight,
            textDecoration: te.textDecoration,
            backgroundColor: te.backgroundColor === "transparent" ? undefined : te.backgroundColor,
            borderRadius: te.borderRadius,
            padding: te.padding,
            display: "flex",
            alignItems: "center",
            justifyContent: te.textAlign === "left" ? "flex-start" : te.textAlign === "right" ? "flex-end" : "center",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          onPointerDown={e => beginMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          {resolveToken(te.content)}
        </div>
      )
    } else if (el.type === "divider") {
      const de = el as DividerElement
      node = (
        <div
          style={{ ...base, display: "flex", alignItems: "center" }}
          onPointerDown={e => beginMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          <div style={{ width: "100%", borderTop: `${de.strokeWidth}px ${de.style} ${de.stroke}` }} />
        </div>
      )
    } else if (el.type === "rectangle") {
      const se = el as ShapeElement
      node = (
        <div
          style={{ ...base, backgroundColor: se.fill === "transparent" ? undefined : se.fill, border: `${se.strokeWidth}px solid ${se.stroke}`, borderRadius: se.borderRadius }}
          onPointerDown={e => beginMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        />
      )
    } else if (el.type === "ellipse") {
      const se = el as ShapeElement
      node = (
        <div
          style={{ ...base, backgroundColor: se.fill === "transparent" ? undefined : se.fill, border: `${se.strokeWidth}px solid ${se.stroke}`, borderRadius: "50%" }}
          onPointerDown={e => beginMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        />
      )
    } else if (el.type === "logo_organizer" || el.type === "logo_sponsor") {
      const le = el as LogoElement
      node = (
        <div
          style={{ ...base, display: "flex", alignItems: "center", justifyContent: "center" }}
          onPointerDown={e => beginMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          {le.src
            ? <img src={le.src} alt={le.label} style={{ width: "100%", height: "100%", objectFit: le.objectFit, pointerEvents: "none", display: "block" }} crossOrigin="anonymous" />
            : (
              <div style={{ width: "100%", height: "100%", border: "1.5px dashed #94a3b860", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#94a3b8", gap: 2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 9 4-4 4 4 4-4 4 4"/><circle cx="8.5" cy="13.5" r="1.5"/></svg>
                <span>{le.label}</span>
              </div>
            )
          }
        </div>
      )
    } else if (el.type === "image") {
      const ie = el as ImageElement
      node = (
        <div
          style={{ ...base, overflow: "hidden", borderRadius: ie.borderRadius }}
          onPointerDown={e => beginMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          <img src={ie.src} alt="" style={{ width: "100%", height: "100%", objectFit: ie.objectFit, pointerEvents: "none", display: "block" }} crossOrigin="anonymous" />
        </div>
      )
    }

    return (
      <div key={el.id}>
        {node}
        {isSelected && (
          <>
            <div style={{
              position: "absolute",
              left: el.x - 1.5, top: el.y - 1.5,
              width: el.width + 3, height: el.height + 3,
              border: "1.5px solid #3b82f6",
              borderRadius: el.type === "ellipse" ? "50%" : 2,
              pointerEvents: "none",
              transform: `rotate(${el.rotation}deg)`,
              transformOrigin: `${el.width / 2 + 1.5}px ${el.height / 2 + 1.5}px`,
            }} />
            {HANDLES.map(h => {
              const hp = HANDLE_POS[h]
              return (
                <div
                  key={h}
                  onPointerDown={e => beginResize(e, el, h)}
                  style={{
                    position: "absolute",
                    left: el.x + hp.cx * el.width - 5,
                    top: el.y + hp.cy * el.height - 5,
                    width: 10, height: 10,
                    background: "#fff",
                    border: "1.5px solid #3b82f6",
                    borderRadius: 2,
                    cursor: CURSOR_MAP[h],
                    zIndex: 9999,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    touchAction: "none",
                  }}
                />
              )
            })}
          </>
        )}
      </div>
    )
  }

  const bg = template.background
  const borderW = bg.borderWidth ?? 2

  return (
    // Outer box: reserves exact scaled space in the scroll area
    <div
      style={{ width: CANVAS_W * zoom, height: CANVAS_H * zoom, position: "relative", flexShrink: 0 }}
      onClick={() => onDeselectAll()}
    >
      {/* Container receives pointer capture — stable DOM node */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: CANVAS_W, height: CANVAS_H,
          transformOrigin: "top left",
          transform: `scale(${zoom})`,
          // Canvas background
          backgroundColor: bg.type === "solid" ? bg.color : undefined,
          backgroundImage:
            bg.type === "gradient" ? bg.gradient
            : bg.type === "image" && bg.imageSrc ? `url(${bg.imageSrc})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: `${borderW}px solid ${bg.borderColor}`,
          boxSizing: "border-box",
          // Do NOT set overflow:hidden — clipping prevents pointer events near edges
          overflow: "visible",
          boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {sorted.map(el => renderElement(el))}
      </div>
    </div>
  )
}
