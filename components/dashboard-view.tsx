"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  FileText, LogOut, Users, History, Trophy,
  ChevronRight, ChevronLeft, Check, Copy, ExternalLink, Palette,
  Settings, MapPin, Calendar, Clock, Eye,
} from "lucide-react"
import { CSVUpload } from "./csv-upload"
import { DesignPicker } from "./design-picker"
import { WordingEditor } from "./wording-editor"
import { LogoUploader } from "./logo-uploader"
import { SignatoryEditor } from "./signatory-editor"
import { CertificateRenderer, CustomTemplateRenderer } from "./certificate-renderer"
import { loadTemplates } from "@/lib/template-editor"
import { WORDING_TEMPLATES } from "@/lib/certificate-wording"
import { MOCK_PARTICIPANTS } from "@/lib/mock-participants"
import type { Participant } from "@/lib/csv-fields"
import type { Signatory, EventData } from "@/lib/certificate-wording"
import type { PublishPayload, TournamentRecord } from "@/lib/tournament-history"

interface DashboardViewProps {
  onPublish: (payload: PublishPayload) => void
  onLogout: () => void
  tournamentHistory: TournamentRecord[]
  onViewTournament: (record: TournamentRecord) => void
}

function BrandKnight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 22H5V20H7L8 18C4.5 17.5 3 14 3 11C3 7.5 5.5 5 8 4L7 2H10L11 4C12 3.5 13.5 3.5 14 4L15 2H18L17 4C19.5 5.5 21 8 21 11C21 14 19.5 17.5 16 18L17 20H19V22ZM10 8C9 8 7 9 7 11C7 13 9 15 12 15C15 15 17 13 17 11C17 9 15 8 14 8H10Z" />
    </svg>
  )
}

const WIZARD_STEPS = [
  { id: 1, label: "Tournament Details", icon: FileText },
  { id: 2, label: "Upload Participants", icon: Users },
  { id: 3, label: "Design Certificate", icon: Palette },
  { id: 4, label: "Publish", icon: ExternalLink },
]

type SidebarView = "wizard" | "history"

export function DashboardView({ onPublish, onLogout, tournamentHistory, onViewTournament }: DashboardViewProps) {
  const [sidebarView, setSidebarView] = useState<SidebarView>("wizard")
  const [step, setStep] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  // Step 1
  const [tournamentName, setTournamentName] = useState("")
  const [venue, setVenue] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isSingleDay, setIsSingleDay] = useState(false)
  const [totalRounds, setTotalRounds] = useState("")

  // Step 2
  const [participants, setParticipants] = useState<Participant[]>([])

  // Step 3
  const [selectedDesign, setSelectedDesign] = useState(1)
  const [customColors, setCustomColors] = useState<Record<string, string>>({})
  const [selectedTemplateId, setSelectedTemplateId] = useState("multi_day")
  const [customWording, setCustomWording] = useState(WORDING_TEMPLATES[0].text)
  const [organizerLogo, setOrganizerLogo] = useState<string | null>(null)
  const [sponsorLogos, setSponsorLogos] = useState<string[]>([])
  const [selectedCustomTemplateId, setSelectedCustomTemplateId] = useState<string | null>(null)
  const [signatories, setSignatories] = useState<Signatory[]>([
    { name: "", designation: "President" },
    { name: "", designation: "Chief Arbiter" },
    { name: "", designation: "Organising Secretary" },
  ])
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Step validation logic
  const validateStep = useCallback((targetStep: number): string[] => {
    const errors: string[] = []
    if (targetStep > 1) {
      if (!tournamentName.trim()) errors.push("Tournament Name is required")
      if (!venue.trim()) errors.push("Venue is required")
      if (!startDate) errors.push("Start Date is required")
      if (!isSingleDay && !endDate) errors.push("End Date is required")
      if (!totalRounds.trim()) errors.push("Total Rounds is required")
    }
    if (targetStep > 2) {
      if (participants.length === 0) errors.push("Upload at least one participant")
    }
    if (targetStep > 3) {
      if (signatories.filter(s => s.name.trim()).length === 0) errors.push("Add at least one signatory name")
    }
    return errors
  }, [tournamentName, venue, startDate, endDate, isSingleDay, totalRounds, participants, signatories])

  const tryGoToStep = useCallback((target: number) => {
    if (target <= step) {
      setValidationErrors([])
      setStep(target)
      return
    }
    const errors = validateStep(target)
    if (errors.length > 0) {
      setValidationErrors(errors)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    setValidationErrors([])
    setStep(target)
  }, [step, validateStep])

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("certify_draft")
      if (raw) {
        const draft = JSON.parse(raw)
        if (draft.tournamentName) {
          setTournamentName(draft.tournamentName)
          if (draft.venue) setVenue(draft.venue)
          if (draft.startDate) setStartDate(draft.startDate)
          if (draft.endDate) setEndDate(draft.endDate)
          if (draft.isSingleDay !== undefined) setIsSingleDay(draft.isSingleDay)
          if (draft.totalRounds) setTotalRounds(draft.totalRounds)
          if (draft.selectedDesign) setSelectedDesign(draft.selectedDesign)
          if (draft.customColors) setCustomColors(draft.customColors)
          if (draft.selectedTemplateId) setSelectedTemplateId(draft.selectedTemplateId)
          if (draft.customWording) setCustomWording(draft.customWording)
          if (draft.organizerLogo) setOrganizerLogo(draft.organizerLogo)
          if (draft.sponsorLogos?.length) setSponsorLogos(draft.sponsorLogos)
          if (draft.signatories?.length) setSignatories(draft.signatories)
          if (draft.step) setStep(draft.step)
          if (draft.participants?.length) setParticipants(draft.participants)
          setHasDraft(true)
        }
      }
    } catch { /* ignore corrupt data */ }
    setDraftLoaded(true)
  }, [])

  // Save draft to localStorage (debounced, only after initial load completes)
  useEffect(() => {
    if (!draftLoaded) return
    const t = setTimeout(() => {
      try {
        const draftData: Record<string, unknown> = {
          tournamentName, venue, startDate, endDate, isSingleDay, totalRounds,
          selectedDesign, customColors, selectedTemplateId, customWording,
          signatories, step, participants,
        }
        // Only include logos if they exist (they're large base64 strings)
        if (organizerLogo) draftData.organizerLogo = organizerLogo
        if (sponsorLogos.length > 0) draftData.sponsorLogos = sponsorLogos
        localStorage.setItem("certify_draft", JSON.stringify(draftData))
      } catch (e) {
        // localStorage quota exceeded - try saving without logos
        try {
          localStorage.setItem("certify_draft", JSON.stringify({
            tournamentName, venue, startDate, endDate, isSingleDay, totalRounds,
            selectedDesign, customColors, selectedTemplateId, customWording,
            signatories, step, participants,
          }))
        } catch { /* truly out of space */ }
      }
    }, 800)
    return () => clearTimeout(t)
  }, [draftLoaded, tournamentName, venue, startDate, endDate, isSingleDay, totalRounds, selectedDesign, customColors, selectedTemplateId, customWording, organizerLogo, sponsorLogos, signatories, step, participants])

  // Custom templates — kept in sync with localStorage via window focus
  const [customTemplatesCache, setCustomTemplatesCache] = useState<ReturnType<typeof loadTemplates>>([])
  useEffect(() => {
    setCustomTemplatesCache(loadTemplates())
    const onFocus = () => setCustomTemplatesCache(loadTemplates())
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])
  const handleNewTournament = useCallback(() => {
    setTournamentName("")
    setVenue("")
    setStartDate("")
    setEndDate("")
    setIsSingleDay(false)
    setTotalRounds("")
    setParticipants([])
    setSelectedDesign(1)
    setCustomColors({})
    setSelectedTemplateId("multi_day")
    setCustomWording(WORDING_TEMPLATES[0].text)
    setOrganizerLogo(null)
    setSponsorLogos([])
    setSelectedCustomTemplateId(null)
    setSignatories([
      { name: "", designation: "President" },
      { name: "", designation: "Chief Arbiter" },
      { name: "", designation: "Organising Secretary" },
    ])
    setStep(1)
    setValidationErrors([])
    setHasDraft(false)
    localStorage.removeItem("certify_draft")
    setSidebarView("wizard")
  }, [])

  const eventData: EventData = {
    tournamentName: tournamentName || "Chess Tournament 2025",
    venue: venue || "Venue",
    startDate: startDate || "01/01/2025",
    endDate: endDate || "05/01/2025",
    isSingleDay,
    totalRounds: totalRounds || "11",
  }

  const previewParticipant = participants[0] || MOCK_PARTICIPANTS[0]

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://certifysports.app/event/${encodeURIComponent(tournamentName || "tournament")}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePublishAndView = () => {
    setShowSuccess(false)
    onPublish({
      participants: participants.length > 0 ? participants : MOCK_PARTICIPANTS,
      selectedDesign,
      wordingTemplate: customWording,
      event: eventData,
      organizerLogo,
      sponsorLogos,
      signatories: signatories.filter(s => s.name || s.designation),
      customColors: Object.keys(customColors).length > 0 ? customColors : undefined,
    })
    // Clear draft after publishing so next login starts fresh
    localStorage.removeItem("certify_draft")
    setHasDraft(false)
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-[#0f172a] text-white shrink-0">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4af37]">
            <BrandKnight className="h-5 w-5 text-[#0f172a]" />
          </div>
          <span className="text-base font-bold font-display tracking-tight">CertifySports</span>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4">
          {/* Primary navigation tabs */}
          <div className="flex gap-1 mb-4 p-1 rounded-lg bg-white/5">
            <button
              onClick={() => setSidebarView("wizard")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                sidebarView === "wizard" ? "bg-white/10 text-[#d4af37]" : "text-white/50 hover:text-white/70"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Create
            </button>
            <button
              onClick={() => setSidebarView("history")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                sidebarView === "history" ? "bg-white/10 text-[#d4af37]" : "text-white/50 hover:text-white/70"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              History
              {tournamentHistory.length > 0 && (
                <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d4af37] text-[#0f172a] text-[10px] font-bold px-1">
                  {tournamentHistory.length}
                </span>
              )}
            </button>
          </div>

          {/* Wizard steps - shown when on wizard view */}
          {sidebarView === "wizard" && (
            <>
              <p className="px-3 mb-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Wizard Steps</p>
              <div className="flex flex-col gap-1">
                {WIZARD_STEPS.map((s) => {
                  const Icon = s.icon
                  const isActive = step === s.id
                  const isDone = step > s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => tryGoToStep(s.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-white/10 text-[#d4af37] font-medium"
                          : isDone
                            ? "text-white/70 hover:bg-white/5"
                            : "text-white/40 hover:bg-white/5"
                      }`}
                    >
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                        isDone ? "bg-[#d4af37] text-[#0f172a]" : isActive ? "bg-white/20 text-[#d4af37]" : "bg-white/10 text-white/40"
                      }`}>
                        {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                      </div>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* History list - shown when on history view */}
          {sidebarView === "history" && (
            <>
              <p className="px-3 mb-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Published Tournaments</p>
              {tournamentHistory.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <Trophy className="h-8 w-8 text-white/10 mx-auto mb-2" />
                  <p className="text-xs text-white/30">No tournaments published yet.</p>
                  <p className="text-xs text-white/20 mt-1">Create your first certificate to see it here.</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {tournamentHistory.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onViewTournament(t)}
                      className="flex items-start gap-2.5 w-full px-3 py-2.5 rounded-lg text-left text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#d4af37]/20 shrink-0 mt-0.5">
                        <Trophy className="h-3.5 w-3.5 text-[#d4af37]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{t.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-[10px] text-white/40">
                            <MapPin className="h-2.5 w-2.5" />{t.venue}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-white/40">
                            <Users className="h-2.5 w-2.5" />{t.participantCount}
                          </span>
                        </div>
                      </div>
                      <Eye className="h-3.5 w-3.5 text-white/20 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex md:hidden items-center gap-2 mr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4af37]">
                <BrandKnight className="h-4 w-4 text-[#0f172a]" />
              </div>
            </div>
            {sidebarView === "wizard" ? (
              <div>
                <h1 className="text-lg font-bold font-display text-foreground">{WIZARD_STEPS.find(s => s.id === step)?.label}</h1>
                <p className="text-sm text-muted-foreground">Step {step} of {WIZARD_STEPS.length}</p>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-bold font-display text-foreground">Tournament History</h1>
                <p className="text-sm text-muted-foreground">{tournamentHistory.length} tournaments published</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {sidebarView === "wizard" && tournamentName.trim() && (
              <Button variant="ghost" size="sm" onClick={handleNewTournament} className="gap-1.5 text-muted-foreground">
                <FileText className="h-4 w-4" /> New
              </Button>
            )}
            {sidebarView === "wizard" && step > 1 && (
              <Button variant="outline" size="sm" onClick={() => tryGoToStep(step - 1)} className="gap-1.5">
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {sidebarView === "wizard" && step < 4 && (
              <Button size="sm" onClick={() => tryGoToStep(step + 1)} className="gap-1.5">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onLogout} className="md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Mobile navigation */}
        <div className="md:hidden flex items-center gap-2 px-6 pt-4">
          <button
            onClick={() => setSidebarView("wizard")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border ${
              sidebarView === "wizard" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
            }`}
          >
            <Palette className="h-3.5 w-3.5" /> Create
          </button>
          <button
            onClick={() => setSidebarView("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border ${
              sidebarView === "history" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border"
            }`}
          >
            <History className="h-3.5 w-3.5" /> History ({tournamentHistory.length})
          </button>
        </div>

        {/* Mobile step indicator */}
        {sidebarView === "wizard" && (
          <div className="md:hidden flex items-center gap-1 px-6 pt-3">
            {WIZARD_STEPS.map((s) => (
              <button key={s.id} onClick={() => tryGoToStep(s.id)} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s.id ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        )}

        <div className="px-6 py-6 max-w-5xl">
          {/* Validation errors banner */}
          {validationErrors.length > 0 && (
            <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <p className="text-sm font-semibold text-destructive mb-1">Please fill in all required fields before proceeding:</p>
              <ul className="list-disc pl-5 space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-sm text-destructive/80">{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ====== HISTORY VIEW ====== */}
          {sidebarView === "history" && (
            <div className="space-y-4">
              {tournamentHistory.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{tournamentHistory.length} published tournament{tournamentHistory.length !== 1 ? "s" : ""}</p>
                  <Button variant="outline" size="sm" onClick={handleNewTournament} className="gap-1.5">
                    <FileText className="h-4 w-4" /> New Tournament
                  </Button>
                </div>
              )}
              {tournamentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground">No tournaments yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Create your first certificate using the wizard, and published tournaments will appear here.
                  </p>
                  <Button onClick={() => setSidebarView("wizard")} className="mt-4 gap-2">
                    <Palette className="h-4 w-4" /> Start Creating
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tournamentHistory.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onViewTournament(t)}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/10 shrink-0">
                        <Trophy className="h-6 w-6 text-[#d4af37]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground text-base">{t.name}</h3>
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />{t.venue}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />{t.date}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />{t.participantCount} participants
                          </span>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />{new Date(t.publishedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                        <Eye className="h-4 w-4" /> View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ====== WIZARD VIEWS ====== */}
          {sidebarView === "wizard" && (
            <>
              {/* Step 1: Tournament Details */}
              {step === 1 && (
                <div className="space-y-6 max-w-2xl">
                  {/* Draft indicator */}
                  {hasDraft && tournamentName.trim() && (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d4af37]/15">
                          <FileText className="h-4 w-4 text-[#d4af37]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Draft restored: {tournamentName}</p>
                          <p className="text-xs text-muted-foreground">Your previous work has been loaded. Continue editing or start fresh.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleNewTournament} className="shrink-0">
                        Start New
                      </Button>
                    </div>
                  )}
                  <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Tournament Name <span className="text-destructive">*</span></Label>
                      <Input value={tournamentName} onChange={(e) => { setTournamentName(e.target.value); setValidationErrors([]) }} placeholder="e.g. 1st AGCA International FIDE Rated Classical Chess Tournament 2025" className={`h-10 ${validationErrors.length > 0 && !tournamentName.trim() ? "border-destructive" : ""}`} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Venue <span className="text-destructive">*</span></Label>
                      <Input value={venue} onChange={(e) => { setVenue(e.target.value); setValidationErrors([]) }} placeholder="e.g. Olympic Stadium, Chhindwara, M.P." className={`h-10 ${validationErrors.length > 0 && !venue.trim() ? "border-destructive" : ""}`} />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                      <Switch checked={isSingleDay} onCheckedChange={setIsSingleDay} id="single-day" />
                      <Label htmlFor="single-day" className="text-sm cursor-pointer">Single-day tournament</Label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">{isSingleDay ? "Tournament Date" : "Start Date"} <span className="text-destructive">*</span></Label>
                        <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setValidationErrors([]) }} className={`h-10 ${validationErrors.length > 0 && !startDate ? "border-destructive" : ""}`} />
                      </div>
                      {!isSingleDay && (
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">End Date <span className="text-destructive">*</span></Label>
                          <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setValidationErrors([]) }} className={`h-10 ${validationErrors.length > 0 && !endDate ? "border-destructive" : ""}`} />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Total Rounds <span className="text-destructive">*</span></Label>
                        <Input type="number" value={totalRounds} onChange={(e) => { setTotalRounds(e.target.value); setValidationErrors([]) }} placeholder="e.g. 11" className={`h-10 ${validationErrors.length > 0 && !totalRounds.trim() ? "border-destructive" : ""}`} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#d4af37]/5 border border-[#d4af37]/20">
                    <Settings className="h-5 w-5 text-[#d4af37] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Pro Tip</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Tournament name and venue will appear on every certificate. Use the full official name.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Upload Participants */}
              {step === 2 && (
                <div className="max-w-4xl space-y-4">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <CSVUpload participants={participants} onUpload={setParticipants} />
                  </div>
                  {participants.length === 0 && (
                    <Button variant="outline" size="sm" onClick={() => setParticipants(MOCK_PARTICIPANTS)} className="gap-1.5 text-xs">
                      Load sample data (20 chess participants)
                    </Button>
                  )}
                </div>
              )}

              {/* Step 3: Design Certificate */}
              {step === 3 && (
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 space-y-6 min-w-0">
                    {/* Template Editor CTA */}
                    <div className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/5 p-4 flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4af37]/15 shrink-0">
                        <Palette className="h-5 w-5 text-[#d4af37]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Design from scratch in the Template Editor</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Drag and drop elements, set fonts, colors, and logos. Save as a named template to reuse anytime.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open("/editor", "_blank", "noopener,noreferrer")}
                        className="shrink-0 gap-1.5 border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Editor
                      </Button>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6">
                      <DesignPicker
                        selectedDesign={selectedDesign}
                        onSelect={setSelectedDesign}
                        customColors={customColors}
                        onCustomColorsChange={setCustomColors}
                        selectedCustomTemplateId={selectedCustomTemplateId}
                        onSelectCustomTemplate={setSelectedCustomTemplateId}
                        previewParticipant={previewParticipant}
                        previewEvent={eventData}
                      />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6">
                      <WordingEditor
                        selectedTemplateId={selectedTemplateId}
                        customWording={customWording}
                        onTemplateChange={setSelectedTemplateId}
                        onWordingChange={setCustomWording}
                      />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6">
                      <LogoUploader
                        organizerLogo={organizerLogo}
                        sponsorLogos={sponsorLogos}
                        onOrganizerLogoChange={setOrganizerLogo}
                        onSponsorLogosChange={setSponsorLogos}
                      />
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6">
                      <SignatoryEditor signatories={signatories} onChange={setSignatories} />
                    </div>
                  </div>

                  <div className="xl:w-[480px] shrink-0">
                    <div className="sticky top-24">
                      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
                        <h3 className="text-sm font-semibold text-foreground mb-2">Live Preview
                          {selectedCustomTemplateId && <span className="ml-2 text-xs text-[#d4af37] font-normal">Custom Template</span>}
                        </h3>
                        <div className="overflow-hidden rounded border border-border">
                          {selectedCustomTemplateId ? (() => {
                            const tpl = customTemplatesCache.find(t => t.id === selectedCustomTemplateId)
                            return tpl ? (
                              <CustomTemplateRenderer
                                template={tpl}
                                participant={previewParticipant}
                                event={eventData}
                                scale={0.56}
                              />
                            ) : (
                              <CertificateRenderer
                                designId={selectedDesign}
                                participant={previewParticipant}
                                event={eventData}
                                wordingTemplate={customWording}
                                signatories={signatories.filter(s => s.name || s.designation)}
                                organizerLogo={organizerLogo}
                                sponsorLogos={sponsorLogos}
                                scale={0.56}
                                customColors={Object.keys(customColors).length > 0 ? customColors : undefined}
                              />
                            )
                          })() : (
                          <CertificateRenderer
                            designId={selectedDesign}
                            participant={previewParticipant}
                            event={eventData}
                            wordingTemplate={customWording}
                            signatories={signatories.filter(s => s.name || s.designation)}
                            organizerLogo={organizerLogo}
                            sponsorLogos={sponsorLogos}
                            scale={0.56}
                            customColors={Object.keys(customColors).length > 0 ? customColors : undefined}
                          />
                          )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground text-center">
                          Previewing: {previewParticipant.title} {previewParticipant.name} | {previewParticipant.position} in {previewParticipant.category}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Publish */}
              {step === 4 && (
                <div className="max-w-2xl space-y-6">
                  <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                    <h3 className="font-display text-lg font-semibold text-foreground">Review & Publish</h3>
                    <div className="space-y-0 divide-y divide-border text-sm">
                      {[
                        ["Tournament", tournamentName || "Not set"],
                        ["Venue", venue || "Not set"],
                        ["Date", `${startDate || "Not set"}${!isSingleDay && endDate ? ` to ${endDate}` : ""}`],
                        ["Rounds", totalRounds || "Not set"],
                        ["Participants", `${participants.length} loaded`],
                        ["Certificate Design", `#${selectedDesign}`],
                        ["Signatories", `${signatories.filter(s => s.name).length} added`],
                        ["Logos", `${organizerLogo ? "1 organizer" : "None"}${sponsorLogos.length ? ` + ${sponsorLogos.length} sponsor` : ""}`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between py-3">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm font-medium text-foreground mb-3">Sample Certificate</p>
                    <div className="overflow-hidden rounded border border-border">
                      <CertificateRenderer
                        designId={selectedDesign}
                        participant={previewParticipant}
                        event={eventData}
                        wordingTemplate={customWording}
                        signatories={signatories.filter(s => s.name || s.designation)}
                        organizerLogo={organizerLogo}
                        sponsorLogos={sponsorLogos}
                        scale={0.82}
                        customColors={Object.keys(customColors).length > 0 ? customColors : undefined}
                      />
                    </div>
                  </div>

                  <Button onClick={() => setShowSuccess(true)} size="lg" className="w-full h-12 font-semibold gap-2 text-base">
                    <ExternalLink className="h-5 w-5" />
                    Generate Public Page
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Success modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/10 mb-3">
              <Check className="h-7 w-7 text-[#d4af37]" />
            </div>
            <DialogTitle className="text-center font-display text-xl">Certificates Published!</DialogTitle>
            <DialogDescription className="text-center">
              {participants.length || 20} certificates generated. Share the link with participants.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
            <code className="flex-1 text-xs text-foreground truncate font-mono">
              certifysports.app/event/{encodeURIComponent(tournamentName || "tournament").slice(0, 30)}
            </code>
            <Button variant="ghost" size="sm" onClick={handleCopyLink} className="shrink-0 gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Button onClick={handlePublishAndView} className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              View Public Page (opens in new tab)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccess(false)
                handleNewTournament()
              }}
              className="w-full gap-2"
            >
              <FileText className="h-4 w-4" />
              Start New Tournament
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
