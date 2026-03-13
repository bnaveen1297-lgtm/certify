import type { Participant } from "./csv-fields"
import { getPronoun } from "./csv-fields"

export interface WordingTemplate {
  id: string
  name: string
  description: string
  text: string
}

export const WORDING_TEMPLATES: WordingTemplate[] = [
  {
    id: "multi_day",
    name: "Multi-Day Tournament",
    description: "For tournaments spanning multiple days with start and end dates",
    text: "This is to certify that {Title} {Name} participated in {Tournament Name} held at {Venue} from {Start Date} to {End Date}. {Pronoun} scored {Points} points out of {Rounds} rounds and secured {Position} position in {Category} category.",
  },
  {
    id: "single_day",
    name: "Single-Day Tournament",
    description: "For one-day events with a single tournament date",
    text: "This is to certify that {Title} {Name} participated in {Tournament Name} held at {Venue} on {Tournament Date}. {Pronoun} scored {Points} points out of {Rounds} rounds and secured {Position} position in {Category} category.",
  },
  {
    id: "with_affiliation",
    name: "With School/Club Affiliation",
    description: "Includes participant's school, club, or organization name",
    text: "This is to certify that {Title} {Name} from {Affiliation} participated in {Tournament Name} held at {Venue} from {Start Date} to {End Date}. {Pronoun} scored {Points} points out of {Rounds} rounds and secured {Position} position in {Category} category.",
  },
]

export interface EventData {
  tournamentName: string
  venue: string
  startDate: string
  endDate: string
  isSingleDay: boolean
  totalRounds: string
}

export interface Signatory {
  name: string
  designation: string
  signatureImage?: string | null
}

export function resolveWording(
  template: string,
  participant: Participant,
  event: EventData
): string {
  const pronoun = getPronoun(participant.gender)
  const rounds = participant.rounds || event.totalRounds

  const replacements: Record<string, string> = {
    "{Title}": participant.title,
    "{Name}": participant.name,
    "{Affiliation}": participant.affiliation,
    "{Tournament Name}": event.tournamentName,
    "{Venue}": event.venue,
    "{Start Date}": event.startDate,
    "{End Date}": event.endDate,
    "{Tournament Date}": event.startDate,
    "{Pronoun}": pronoun.subject,
    "{Points}": participant.points,
    "{Rounds}": rounds,
    "{Position}": participant.position,
    "{Category}": participant.category,
  }

  let result = template
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), value || "___")
  }

  return result
}

export function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{[^}]+\}/g)
  return matches ? [...new Set(matches)] : []
}
