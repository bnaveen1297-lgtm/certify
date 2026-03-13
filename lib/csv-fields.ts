export interface CSVField {
  key: string
  label: string
  required: boolean
  description: string
  example: string
}

export const CSV_FIELDS: CSVField[] = [
  {
    key: "title",
    label: "Title",
    required: true,
    description: "Prefix: Mr./Ms./Mrs./Master/Selvan/Selvi",
    example: "Mr.",
  },
  {
    key: "name",
    label: "Name",
    required: true,
    description: "Full name of the participant",
    example: "Arjun Kumar",
  },
  {
    key: "gender",
    label: "Gender",
    required: true,
    description: "Male / Female (used for He/She pronoun in certificate text)",
    example: "Male",
  },
  {
    key: "affiliation",
    label: "School/Club/Affiliation",
    required: false,
    description: "School name, district, state, country, or club name",
    example: "Sairam Matric Hr. Sec. School, Thiruvarur",
  },
  {
    key: "points",
    label: "Points",
    required: true,
    description: "Points scored in the tournament (can be decimal like 9.5)",
    example: "9.5",
  },
  {
    key: "rounds",
    label: "Rounds",
    required: false,
    description: "Total number of rounds played. If blank, uses tournament-level value.",
    example: "11",
  },
  {
    key: "position",
    label: "Position",
    required: true,
    description: "Rank or position secured (e.g. 1st, 2nd, 5th)",
    example: "1st",
  },
  {
    key: "category",
    label: "Category",
    required: true,
    description: "Category name: Open, Under-18 Boys, Under-14 Girls, etc.",
    example: "Open",
  },
]

export interface Participant {
  title: string
  name: string
  gender: string
  affiliation: string
  points: string
  rounds: string
  position: string
  category: string
}

export function getPronoun(gender: string): { subject: string; possessive: string } {
  const g = gender?.toLowerCase().trim()
  if (g === "female" || g === "f") {
    return { subject: "She", possessive: "Her" }
  }
  return { subject: "He", possessive: "His" }
}

export function parseCSV(text: string): Participant[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  const fieldMap: Record<string, string> = {}
  CSV_FIELDS.forEach((field) => {
    const headerIndex = headers.findIndex(
      (h) =>
        h === field.key.toLowerCase() ||
        h === field.label.toLowerCase() ||
        h.includes(field.key.toLowerCase()) ||
        h.includes(field.label.toLowerCase().split("/")[0].trim())
    )
    if (headerIndex >= 0) {
      fieldMap[field.key] = String(headerIndex)
    }
  })

  const participants: Participant[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    if (values.length < 2 || !values.some((v) => v.length > 0)) continue

    participants.push({
      title: values[Number(fieldMap["title"])] || "",
      name: values[Number(fieldMap["name"])] || "",
      gender: values[Number(fieldMap["gender"])] || "",
      affiliation: values[Number(fieldMap["affiliation"])] || "",
      points: values[Number(fieldMap["points"])] || "",
      rounds: values[Number(fieldMap["rounds"])] || "",
      position: values[Number(fieldMap["position"])] || "",
      category: values[Number(fieldMap["category"])] || "",
    })
  }

  return participants
}
