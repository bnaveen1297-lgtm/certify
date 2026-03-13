"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { LoginView } from "@/components/login-view"
import { DashboardView } from "@/components/dashboard-view"
import type { PublishPayload, TournamentRecord } from "@/lib/tournament-history"
import { generateId } from "@/lib/tournament-history"

const SESSION_KEY = "certify_session"
const DRAFT_KEY = "certify_draft"
const HISTORY_KEY = "certify_history"
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

interface SessionData {
  loggedIn: boolean
  email: string
  loginTime: number
  lastActivity: number
}

function getSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as SessionData
    if (Date.now() - session.lastActivity > SESSION_TIMEOUT_MS) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch { return null }
}

function setSession(email: string) {
  const session: SessionData = { loggedIn: true, email, loginTime: Date.now(), lastActivity: Date.now() }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function touchSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return
    const session = JSON.parse(raw) as SessionData
    session.lastActivity = Date.now()
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch { /* noop */ }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

function loadHistory(): TournamentRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHistory(records: TournamentRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records))
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [tournamentHistory, setTournamentHistory] = useState<TournamentRecord[]>([])
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check session on mount
  useEffect(() => {
    const session = getSession()
    if (session) {
      setIsLoggedIn(true)
      touchSession()
    }
    setTournamentHistory(loadHistory())
    setSessionChecked(true)
  }, [])

  // Session timeout checker - every 60 seconds
  useEffect(() => {
    if (!isLoggedIn) return
    sessionTimerRef.current = setInterval(() => {
      const session = getSession()
      if (!session) {
        setIsLoggedIn(false)
      }
    }, 60000)
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current) }
  }, [isLoggedIn])

  // Activity listener - reset session timeout on any interaction
  useEffect(() => {
    if (!isLoggedIn) return
    const handler = () => touchSession()
    window.addEventListener("click", handler)
    window.addEventListener("keydown", handler)
    window.addEventListener("scroll", handler)
    return () => {
      window.removeEventListener("click", handler)
      window.removeEventListener("keydown", handler)
      window.removeEventListener("scroll", handler)
    }
  }, [isLoggedIn])

  const handleLogin = useCallback((email: string) => {
    setSession(email)
    setIsLoggedIn(true)
  }, [])

  const handleLogout = useCallback(() => {
    clearSession()
    // Don't remove draft from localStorage on logout - keep it for next session
    setIsLoggedIn(false)
  }, [])

  const handlePublish = useCallback((payload: PublishPayload) => {
    setTournamentHistory(prev => {
      const exists = prev.find(t => t.name === payload.event.tournamentName)
      // Reuse existing ID if updating, otherwise generate new
      const eventId = exists ? exists.id : generateId()
      const record: TournamentRecord = {
        id: eventId,
        name: payload.event.tournamentName,
        venue: payload.event.venue,
        date: payload.event.startDate + (payload.event.endDate && !payload.event.isSingleDay ? ` - ${payload.event.endDate}` : ""),
        participantCount: payload.participants.length,
        publishedAt: new Date().toISOString(),
        payload,
      }

      const updated = exists
        ? prev.map(t => t.id === eventId ? record : t)
        : [record, ...prev]

      saveHistory(updated)

      // Store published data for the public page
      localStorage.setItem(`certify_event_${eventId}`, JSON.stringify(payload))

      // Open public page in new tab
      window.open(`/event/${eventId}`, "_blank", "noopener,noreferrer")

      return updated
    })
  }, [])

  const handleViewTournament = useCallback((record: TournamentRecord) => {
    // Store the payload for the public page to read
    localStorage.setItem(`certify_event_${record.id}`, JSON.stringify(record.payload))
    // Open in new tab
    window.open(`/event/${record.id}`, "_blank", "noopener,noreferrer")
  }, [])

  // Show nothing until session is checked
  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={handleLogin}
        tournamentHistory={tournamentHistory}
        onViewTournament={handleViewTournament}
      />
    )
  }

  return (
    <DashboardView
      onPublish={handlePublish}
      onLogout={handleLogout}
      tournamentHistory={tournamentHistory}
      onViewTournament={handleViewTournament}
    />
  )
}
