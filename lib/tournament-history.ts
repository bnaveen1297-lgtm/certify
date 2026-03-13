import type { Participant } from "@/lib/csv-fields"
import type { EventData, Signatory } from "@/lib/certificate-wording"

export interface PublishPayload {
  participants: Participant[]
  selectedDesign: number
  wordingTemplate: string
  event: EventData
  organizerLogo: string | null
  sponsorLogos: string[]
  signatories: Signatory[]
  customColors?: Record<string, string>
}

export interface TournamentRecord {
  id: string
  name: string
  venue: string
  date: string
  participantCount: number
  publishedAt: string
  payload: PublishPayload
}

/* Generate a short ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}
