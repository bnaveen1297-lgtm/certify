export interface CertificateDesign {
  id: number
  name: string
  category: "classic" | "modern" | "premium" | "playful" | "institutional"
  /* colors */
  borderColor: string
  bgColor: string
  headerColor: string
  accentColor: string
  textColor: string
  certTitleText: string
}

export const CERTIFICATE_DESIGNS: CertificateDesign[] = [
  /* ---- CLASSIC ---- */
  { id: 1, name: "Royal Gold", category: "classic", borderColor: "#b8860b", bgColor: "#fffef5", headerColor: "#8b6914", accentColor: "#d4af37", textColor: "#1a1a1a", certTitleText: "Certificate of Merit" },
  { id: 2, name: "Maroon Heritage", category: "classic", borderColor: "#800020", bgColor: "#fdf8f8", headerColor: "#800020", accentColor: "#c41e3a", textColor: "#2d0a0a", certTitleText: "Certificate of Merit" },
  { id: 3, name: "Wooden Board", category: "classic", borderColor: "#8b4513", bgColor: "#faf0e6", headerColor: "#5c2d0e", accentColor: "#a0522d", textColor: "#3d1e0a", certTitleText: "Certificate of Merit" },
  { id: 4, name: "Opening Moves", category: "classic", borderColor: "#44403c", bgColor: "#fafaf9", headerColor: "#292524", accentColor: "#78716c", textColor: "#1c1917", certTitleText: "Certificate of Participation" },
  /* ---- MODERN ---- */
  { id: 5, name: "FIDE Blue", category: "modern", borderColor: "#2563eb", bgColor: "#ffffff", headerColor: "#1e40af", accentColor: "#3b82f6", textColor: "#1e293b", certTitleText: "Certificate of Appreciation" },
  { id: 6, name: "Checkmate Blue", category: "modern", borderColor: "#1d4ed8", bgColor: "#ffffff", headerColor: "#1e40af", accentColor: "#1d4ed8", textColor: "#1e293b", certTitleText: "Certificate of Participation" },
  { id: 7, name: "Speed Red", category: "modern", borderColor: "#dc2626", bgColor: "#ffffff", headerColor: "#dc2626", accentColor: "#f97316", textColor: "#1e293b", certTitleText: "Rapid Chess Certificate" },
  { id: 8, name: "Minimalist", category: "modern", borderColor: "#18181b", bgColor: "#ffffff", headerColor: "#18181b", accentColor: "#71717a", textColor: "#18181b", certTitleText: "Certificate" },
  /* ---- PREMIUM ---- */
  { id: 9, name: "Grandmaster Gold", category: "premium", borderColor: "#d4af37", bgColor: "#fefdf5", headerColor: "#8b6914", accentColor: "#b8860b", textColor: "#3d2e0a", certTitleText: "Grandmaster Certificate" },
  { id: 10, name: "Dark Knight", category: "premium", borderColor: "#d4af37", bgColor: "#0f172a", headerColor: "#d4af37", accentColor: "#f59e0b", textColor: "#e2e8f0", certTitleText: "Certificate of Honor" },
  { id: 11, name: "Black & Gold Elite", category: "premium", borderColor: "#1a1a1a", bgColor: "#fffef8", headerColor: "#1a1a1a", accentColor: "#d4af37", textColor: "#1a1a1a", certTitleText: "Certificate of Excellence" },
  { id: 12, name: "Emerald Bishop", category: "premium", borderColor: "#166534", bgColor: "#f7fdf9", headerColor: "#166534", accentColor: "#22c55e", textColor: "#14532d", certTitleText: "Certificate of Distinction" },
  /* ---- PLAYFUL (Kids themes) ---- */
  { id: 13, name: "Pawn Stars (Kids)", category: "playful", borderColor: "#7c3aed", bgColor: "#faf5ff", headerColor: "#6d28d9", accentColor: "#a78bfa", textColor: "#1e1b4b", certTitleText: "Star Player Award" },
  { id: 14, name: "Trophy Gold (Kids)", category: "playful", borderColor: "#d4af37", bgColor: "#fffef5", headerColor: "#92710a", accentColor: "#eab308", textColor: "#1a1a1a", certTitleText: "Champion Award" },
  { id: 15, name: "Checkered Flag (Kids)", category: "playful", borderColor: "#1a1a1a", bgColor: "#ffffff", headerColor: "#1a1a1a", accentColor: "#d4af37", textColor: "#1a1a1a", certTitleText: "Certificate of Achievement" },
  { id: 16, name: "Knight Quest (Kids)", category: "playful", borderColor: "#0e7490", bgColor: "#f0fdfa", headerColor: "#0e7490", accentColor: "#14b8a6", textColor: "#134e4a", certTitleText: "Young Knight Award" },
  /* ---- INSTITUTIONAL ---- */
  { id: 17, name: "Indian Tricolor", category: "institutional", borderColor: "#b45309", bgColor: "#fffbeb", headerColor: "#92400e", accentColor: "#16a34a", textColor: "#1c1917", certTitleText: "Certificate of Achievement" },
  { id: 18, name: "Lions Club", category: "institutional", borderColor: "#1e3a5f", bgColor: "#ffffff", headerColor: "#1e3a5f", accentColor: "#d4af37", textColor: "#1a1a1a", certTitleText: "Certificate of Merit" },
  { id: 19, name: "Federation Style", category: "institutional", borderColor: "#1e40af", bgColor: "#eff6ff", headerColor: "#1e40af", accentColor: "#3b82f6", textColor: "#1e3a5f", certTitleText: "Tournament Certificate" },
  { id: 20, name: "Association Classic", category: "institutional", borderColor: "#374151", bgColor: "#f9fafb", headerColor: "#374151", accentColor: "#6b7280", textColor: "#111827", certTitleText: "Certificate of Participation" },
]
