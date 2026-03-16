"use client"

import { useRef, useCallback, useState, useEffect } from "react"
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
  e: { cx: 1, cy: 0.5 }, se: { cx: 1, cy: 1 }, s: { cx: 0.5, cy: 1 },
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
  onSelectElement, onUpdateElement, onDeselectAll, onUpdateBackground,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // All drag state lives in a ref — no re-renders, no stale closures
  const drag = useRef<{
    active: boolean
    type: "move" | "resize"
    id: string
    handle: Handle | null
    startClientX: number
    startClientY: number
    origX: number
    origY: number
    origW: number
    origH: number
  } | null>(null)

  // Keep latest callbacks in refs so event listeners never go stale
  const onUpdateElementRef = useRef(onUpdateElement)
  useEffect(() => { onUpdateElementRef.current = onUpdateElement }, [onUpdateElement])
  const zoomRef = useRef(zoom)
  useEffect(() => { zoomRef.current = zoom }, [zoom])

  // Global pointer move / up
  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      const ds = drag.current
      if (!ds || !ds.active) return

      const dxClient = e.clientX - ds.startClientX
      const dyClient = e.clientY - ds.startClientY
      const z = zoomRef.current
      const dx = dxClient / z
      const dy = dyClient / z

      if (ds.type === "move") {
        const nx = Math.max(0, Math.min(CANVAS_W - ds.origW, ds.origX + dx))
        const ny = Math.max(0, Math.min(CANVAS_H - ds.origH, ds.origY + dy))
        onUpdateElementRef.current(ds.id, { x: Math.round(nx), y: Math.round(ny) })
      } else if (ds.type === "resize" && ds.handle) {
        const h = ds.handle
        let nx = ds.origX, ny = ds.origY, nw = ds.origW, nh = ds.origH
        if (h.includes("e")) nw = Math.max(20, ds.origW + dx)
        if (h.includes("s")) nh = Math.max(10, ds.origH + dy)
        if (h.includes("w")) { nw = Math.max(20, ds.origW - dx); nx = ds.origX + (ds.origW - nw) }
        if (h.includes("n")) { nh = Math.max(10, ds.origH - dy); ny = ds.origY + (ds.origH - nh) }
        onUpdateElementRef.current(ds.id, {
          x: Math.round(nx), y: Math.round(ny),
          width: Math.round(nw), height: Math.round(nh),
        })
      }
    }

    function onPointerUp() {
      if (drag.current) drag.current.active = false
      drag.current = null
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, []) // empty — never reinstalls, uses refs

  const startMove = useCallback((e: React.PointerEvent, el: TemplateElement) => {
    if (el.locked) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    onSelectElement(el.id)
    drag.current = {
      active: true, type: "move", id: el.id, handle: null,
      startClientX: e.clientX, startClientY: e.clientY,
      origX: el.x, origY: el.y, origW: el.width, origH: el.height,
    }
  }, [onSelectElement])

  const startResize = useCallback((e: React.PointerEvent, el: TemplateElement, handle: Handle) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = {
      active: true, type: "resize", id: el.id, handle,
      startClientX: e.clientX, startClientY: e.clientY,
      origX: el.x, origY: el.y, origW: el.width, origH: el.height,
    }
  }, [])

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  function renderElement(el: TemplateElement) {
    if (!el.visible) return null
    const isSelected = selectedId === el.id

    const commonStyle: React.CSSProperties = {
      position: "absolute",
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.height,
      transform: `rotate(${el.rotation}deg)`,
      opacity: el.opacity / 100,
      cursor: el.locked ? "not-allowed" : "move",
      userSelect: "none",
      boxSizing: "border-box",
      touchAction: "none",
    }

    let content: React.ReactNode = null

    if (el.type === "text" || el.type === "heading") {
      const te = el as TextElement
      content = (
        <div
          style={{
            ...commonStyle,
            fontFamily: te.fontFamily,
            fontSize: te.fontSize,
            fontWeight: te.fontWeight,
            fontStyle: te.fontStyle,
            color: te.color,
            textAlign: te.textAlign,
            letterSpacing: `${te.letterSpacing}em`,
            lineHeight: te.lineHeight,
            textDecoration: te.textDecoration,
            backgroundColor: te.backgroundColor === "transparent" ? "transparent" : te.backgroundColor,
            borderRadius: te.borderRadius,
            padding: te.padding,
            display: "flex",
            alignItems: "center",
            justifyContent: te.textAlign === "left" ? "flex-start" : te.textAlign === "right" ? "flex-end" : "center",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          onPointerDown={e => startMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          {resolveToken(te.content)}
        </div>
      )
    } else if (el.type === "divider") {
      const de = el as DividerElement
      content = (
        <div
          style={{ ...commonStyle, display: "flex", alignItems: "center" }}
          onPointerDown={e => startMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          <div style={{ width: "100%", borderTop: `${de.strokeWidth}px ${de.style} ${de.stroke}` }} />
        </div>
      )
    } else if (el.type === "rectangle") {
      const se = el as ShapeElement
      content = (
        <div
          style={{
            ...commonStyle,
            backgroundColor: se.fill === "transparent" ? "transparent" : se.fill,
            border: `${se.strokeWidth}px solid ${se.stroke}`,
            borderRadius: se.borderRadius,
          }}
          onPointerDown={e => startMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        />
      )
    } else if (el.type === "ellipse") {
      const se = el as ShapeElement
      content = (
        <div
          style={{
            ...commonStyle,
            backgroundColor: se.fill === "transparent" ? "transparent" : se.fill,
            border: `${se.strokeWidth}px solid ${se.stroke}`,
            borderRadius: "50%",
          }}
          onPointerDown={e => startMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        />
      )
    } else if (el.type === "logo_organizer" || el.type === "logo_sponsor") {
      const le = el as LogoElement
      content = (
        <div
          style={{ ...commonStyle, display: "flex", alignItems: "center", justifyContent: "center" }}
          onPointerDown={e => startMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          {le.src ? (
            <img src={le.src} alt={le.label} style={{ width: "100%", height: "100%", objectFit: le.objectFit, pointerEvents: "none" }} crossOrigin="anonymous" />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              border: "1.5px dashed #94a3b860", borderRadius: 4,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: "#94a3b8", gap: 2,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="m3 9 4-4 4 4 4-4 4 4"/>
                <circle cx="8.5" cy="13.5" r="1.5"/>
              </svg>
              <span>{le.label}</span>
            </div>
          )}
        </div>
      )
    } else if (el.type === "image") {
      const ie = el as ImageElement
      content = (
        <div
          style={{ ...commonStyle, overflow: "hidden", borderRadius: ie.borderRadius }}
          onPointerDown={e => startMove(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          <img src={ie.src} alt="" style={{ width: "100%", height: "100%", objectFit: ie.objectFit, pointerEvents: "none" }} crossOrigin="anonymous" />
        </div>
      )
    }

    return (
      <div key={el.id} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {content}
        {isSelected && (
          <>
            {/* Selection outline */}
            <div style={{
              position: "absolute",
              left: el.x - 1.5,
              top: el.y - 1.5,
              width: el.width + 3,
              height: el.height + 3,
              border: "1.5px solid #3b82f6",
              borderRadius: el.type === "ellipse" ? "50%" : 2,
              pointerEvents: "none",
              transform: `rotate(${el.rotation}deg)`,
              transformOrigin: `${el.width / 2 + 1.5}px ${el.height / 2 + 1.5}px`,
            }} />
            {/* Resize handles */}
            {HANDLES.map(h => {
              const hp = HANDLE_POS[h]
              return (
                <div
                  key={h}
                  onPointerDown={e => startResize(e, el, h)}
                  style={{
                    position: "absolute",
                    left: el.x + hp.cx * el.width - 5,
                    top: el.y + hp.cy * el.height - 5,
                    width: 10,
                    height: 10,
                    backgroundColor: "#fff",
                    border: "1.5px solid #3b82f6",
                    borderRadius: 2,
                    cursor: CURSOR_MAP[h],
                    pointerEvents: "all",
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
  const canvasStyle: React.CSSProperties = {
    position: "relative",
    width: CANVAS_W,
    height: CANVAS_H,
    backgroundColor: bg.type === "solid" ? bg.color : undefined,
    backgroundImage:
      bg.type === "gradient" ? bg.gradient
      : bg.type === "image" && bg.imageSrc ? `url(${bg.imageSrc})`
      : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: `${bg.borderWidth}px solid ${bg.borderColor}`,
    boxSizing: "border-box",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
  }

  return (
    <div
      style={{
        width: CANVAS_W * zoom,
        height: CANVAS_H * zoom,
        position: "relative",
        flexShrink: 0,
        /* Scale the inner canvas — this is the ONLY scale operation */
        transform: "none",
      }}
      onClick={() => onDeselectAll()}
    >
      <div
        ref={canvasRef}
        style={{
          ...canvasStyle,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
      >
        {sorted.map(el => renderElement(el))}
      </div>
    </div>
  )
}
