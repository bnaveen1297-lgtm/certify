"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import {
  CertificateTemplate, TemplateElement, CanvasBackground,
  TextElement, ShapeElement, DividerElement, LogoElement, ImageElement,
  CANVAS_W, CANVAS_H, TEXT_TOKENS,
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

function resolveToken(content: string): string {
  return content
    .replace(/\{FullName\}/g, "Ms. Priya Sharma")
    .replace(/\{Name\}/g, "Priya Sharma")
    .replace(/\{Title\}/g, "Ms.")
    .replace(/\{Position\}/g, "1st")
    .replace(/\{Category\}/g, "Open")
    .replace(/\{Points\}/g, "8.5")
    .replace(/\{TournamentName\}/g, "National Chess Championship 2025")
    .replace(/\{Venue\}/g, "Olympic Stadium, Mumbai")
    .replace(/\{StartDate\}/g, "01 Jan 2025")
    .replace(/\{EndDate\}/g, "05 Jan 2025")
    .replace(/\{Rounds\}/g, "11")
}

export function EditorCanvas({
  template, selectedId, zoom, onSelectElement, onUpdateElement, onDeselectAll, onUpdateBackground,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{
    type: "move" | "resize"
    id: string
    startX: number; startY: number
    origX: number; origY: number
    origW: number; origH: number
    handle?: Handle
  } | null>(null)

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex)

  const toCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / zoom,
      y: (clientY - rect.top) / zoom,
    }
  }, [zoom])

  const onMouseMove = useCallback((e: MouseEvent) => {
    const ds = dragState.current
    if (!ds) return
    const { x, y } = toCanvas(e.clientX, e.clientY)
    const dx = x - ds.startX
    const dy = y - ds.startY

    if (ds.type === "move") {
      const nx = Math.max(0, Math.min(CANVAS_W - ds.origW, ds.origX + dx))
      const ny = Math.max(0, Math.min(CANVAS_H - ds.origH, ds.origY + dy))
      onUpdateElement(ds.id, { x: Math.round(nx), y: Math.round(ny) })
    } else if (ds.type === "resize" && ds.handle) {
      const h = ds.handle
      let nx = ds.origX, ny = ds.origY, nw = ds.origW, nh = ds.origH
      if (h.includes("e")) nw = Math.max(20, ds.origW + dx)
      if (h.includes("s")) nh = Math.max(10, ds.origH + dy)
      if (h.includes("w")) { nw = Math.max(20, ds.origW - dx); nx = ds.origX + ds.origW - nw }
      if (h.includes("n")) { nh = Math.max(10, ds.origH - dy); ny = ds.origY + ds.origH - nh }
      onUpdateElement(ds.id, { x: Math.round(nx), y: Math.round(ny), width: Math.round(nw), height: Math.round(nh) })
    }
  }, [toCanvas, onUpdateElement])

  const onMouseUp = useCallback(() => { dragState.current = null }, [])

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  const startDrag = (e: React.MouseEvent, el: TemplateElement) => {
    if (el.locked) return
    e.stopPropagation()
    onSelectElement(el.id)
    const { x, y } = toCanvas(e.clientX, e.clientY)
    dragState.current = { type: "move", id: el.id, startX: x, startY: y, origX: el.x, origY: el.y, origW: el.width, origH: el.height }
  }

  const startResize = (e: React.MouseEvent, el: TemplateElement, handle: Handle) => {
    e.stopPropagation()
    const { x, y } = toCanvas(e.clientX, e.clientY)
    dragState.current = { type: "resize", id: el.id, startX: x, startY: y, origX: el.x, origY: el.y, origW: el.width, origH: el.height, handle }
  }

  // ── Render individual element
  function renderElement(el: TemplateElement) {
    if (!el.visible) return null
    const isSelected = selectedId === el.id
    const commonStyle: React.CSSProperties = {
      position: "absolute",
      left: el.x, top: el.y,
      width: el.width, height: el.height,
      transform: `rotate(${el.rotation}deg)`,
      opacity: el.opacity / 100,
      cursor: el.locked ? "default" : "move",
      userSelect: "none",
      boxSizing: "border-box",
    }

    let inner: React.ReactNode = null

    if (el.type === "text" || el.type === "heading") {
      const te = el as TextElement
      inner = (
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
            backgroundColor: te.backgroundColor === "transparent" ? undefined : te.backgroundColor,
            borderRadius: te.borderRadius,
            padding: te.padding,
            display: "flex", alignItems: "center",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          onMouseDown={e => startDrag(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          {resolveToken(te.content)}
        </div>
      )
    } else if (el.type === "divider") {
      const de = el as DividerElement
      inner = (
        <div
          style={{ ...commonStyle, display: "flex", alignItems: "center" }}
          onMouseDown={e => startDrag(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          <div style={{
            width: "100%",
            borderTop: `${de.strokeWidth}px ${de.style} ${de.stroke}`,
          }} />
        </div>
      )
    } else if (el.type === "rectangle") {
      const se = el as ShapeElement
      inner = (
        <div
          style={{
            ...commonStyle,
            backgroundColor: se.fill === "transparent" ? undefined : se.fill,
            border: `${se.strokeWidth}px solid ${se.stroke}`,
            borderRadius: se.borderRadius,
          }}
          onMouseDown={e => startDrag(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        />
      )
    } else if (el.type === "ellipse") {
      const se = el as ShapeElement
      inner = (
        <div
          style={{
            ...commonStyle,
            backgroundColor: se.fill === "transparent" ? undefined : se.fill,
            border: `${se.strokeWidth}px solid ${se.stroke}`,
            borderRadius: "50%",
          }}
          onMouseDown={e => startDrag(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        />
      )
    } else if (el.type === "logo_organizer" || el.type === "logo_sponsor") {
      const le = el as LogoElement
      inner = (
        <div
          style={{ ...commonStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}
          onMouseDown={e => startDrag(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          {le.src ? (
            <img src={le.src} alt={le.label} style={{ width: "100%", height: "100%", objectFit: le.objectFit }} crossOrigin="anonymous" />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              border: "1.5px dashed #94a3b860",
              borderRadius: 4,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              fontSize: 9, color: "#94a3b8", gap: 2,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 9 4-4 4 4 4-4 4 4"/><circle cx="8.5" cy="13.5" r="1.5"/></svg>
              <span>{le.label}</span>
            </div>
          )}
        </div>
      )
    } else if (el.type === "image") {
      const ie = el as ImageElement
      inner = (
        <div
          style={{ ...commonStyle, overflow: "hidden", borderRadius: ie.borderRadius }}
          onMouseDown={e => startDrag(e, el)}
          onClick={e => { e.stopPropagation(); onSelectElement(el.id) }}
        >
          <img src={ie.src} alt="" style={{ width: "100%", height: "100%", objectFit: ie.objectFit }} crossOrigin="anonymous" />
        </div>
      )
    }

    return (
      <div key={el.id} style={{ position: "absolute", left: 0, top: 0, width: CANVAS_W, height: CANVAS_H, pointerEvents: "none" }}>
        {inner}
        {/* Selection handles */}
        {isSelected && (
          <div style={{
            position: "absolute",
            left: el.x - 1, top: el.y - 1,
            width: el.width + 2, height: el.height + 2,
            border: "1.5px solid #3b82f6",
            pointerEvents: "none",
            borderRadius: (el.type === "ellipse") ? "50%" : undefined,
          }}>
            {HANDLES.map(h => {
              const hp = HANDLE_POS[h]
              return (
                <div
                  key={h}
                  onMouseDown={e => startResize(e, el, h)}
                  style={{
                    position: "absolute",
                    left: `calc(${hp.cx * 100}% - 5px)`,
                    top: `calc(${hp.cy * 100}% - 5px)`,
                    width: 10, height: 10,
                    backgroundColor: "#fff",
                    border: "1.5px solid #3b82f6",
                    borderRadius: 2,
                    cursor: `${h}-resize`,
                    pointerEvents: "all",
                    zIndex: 9999,
                  }}
                />
              )
            })}
          </div>
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
    backgroundImage: bg.type === "gradient" ? bg.gradient : bg.type === "image" && bg.imageSrc ? `url(${bg.imageSrc})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: `${bg.borderWidth}px solid ${bg.borderColor}`,
    boxSizing: "border-box",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
    transform: `scale(${zoom})`,
    transformOrigin: "top left",
  }

  return (
    <div
      style={{ width: CANVAS_W * zoom, height: CANVAS_H * zoom, position: "relative", flexShrink: 0 }}
      onClick={() => onDeselectAll()}
    >
      <div ref={canvasRef} style={canvasStyle}>
        {sorted.map(el => renderElement(el))}
      </div>
    </div>
  )
}
