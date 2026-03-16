"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PublicSearchView } from "@/components/public-search-view"
import type { PublishPayload } from "@/lib/tournament-history"

export default function PublicEventPage() {
  const params = useParams()
  const [payload, setPayload] = useState<PublishPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadEvent() {
      try {
        // In Next.js 16, params may be a Promise
        const resolvedParams = params && typeof (params as any).then === "function"
          ? await (params as any)
          : params
        const id = resolvedParams?.id as string
        if (!id) { setError(true); setLoading(false); return }
        const raw = localStorage.getItem(`certify_event_${id}`)
        if (!raw) { setError(true); setLoading(false); return }
        const data = JSON.parse(raw) as PublishPayload
        setPayload(data)
      } catch {
        setError(true)
      }
      setLoading(false)
    }
    loadEvent()
  }, [params])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-muted-foreground">
              <path d="M19 22H5V20H7L8 18C4.5 17.5 3 14 3 11C3 7.5 5.5 5 8 4L7 2H10L11 4C12 3.5 13.5 3.5 14 4L15 2H18L17 4C19.5 5.5 21 8 21 11C21 14 19.5 17.5 16 18L17 20H19V22ZM10 8C9 8 7 9 7 11C7 13 9 15 12 15C15 15 17 13 17 11C17 9 15 8 14 8H10Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold font-sans text-foreground mb-2">Event Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This event link may have expired or is not available on this device. Please ask the organizer for a new link.
          </p>
        </div>
      </div>
    )
  }

  return <PublicSearchView {...payload} />
}
