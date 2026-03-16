"use client"

import { useState, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CertificateRenderer, downloadCertificateAsPDF } from "@/components/certificate-renderer"
import type { Participant } from "@/lib/csv-fields"
import type { PublishPayload } from "@/lib/tournament-history"
import {
  Search, Trophy, Download, Share2, Medal, Crown,
  ChevronDown, ChevronUp, Eye, MessageCircle, Linkedin, Loader2,
} from "lucide-react"

export type { PublishPayload }

interface PublicSearchViewProps extends PublishPayload {
  onBack?: () => void
}

function BrandKnight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 22H5V20H7L8 18C4.5 17.5 3 14 3 11C3 7.5 5.5 5 8 4L7 2H10L11 4C12 3.5 13.5 3.5 14 4L15 2H18L17 4C19.5 5.5 21 8 21 11C21 14 19.5 17.5 16 18L17 20H19V22ZM10 8C9 8 7 9 7 11C7 13 9 15 12 15C15 15 17 13 17 11C17 9 15 8 14 8H10Z" />
    </svg>
  )
}

export function PublicSearchView({
  participants,
  selectedDesign,
  wordingTemplate,
  event,
  organizerLogo,
  sponsorLogos,
  signatories,
  customColors,
  onBack,
}: PublicSearchViewProps) {
  const [search, setSearch] = useState("")
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [showCert, setShowCert] = useState(false)
  const [showFullStandings, setShowFullStandings] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const certRef = useRef<HTMLDivElement>(null)

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      const posA = parseInt(a.position) || 999
      const posB = parseInt(b.position) || 999
      return posA - posB
    })
  }, [participants])

  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return sortedParticipants.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.affiliation.toLowerCase().includes(q)
    )
  }, [search, sortedParticipants])

  const top3 = sortedParticipants.slice(0, 3)
  const displayStandings = showFullStandings ? sortedParticipants : sortedParticipants.slice(0, 10)

  function getRankIcon(pos: string) {
    const n = parseInt(pos)
    if (n === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (n === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (n === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="text-sm font-bold text-muted-foreground">#{n || pos}</span>
  }

  async function handleDownload(p: Participant) {
    setDownloading(true)
    const safeName = p.name.replace(/[^a-zA-Z0-9]/g, "_")
    const success = await downloadCertificateAsPDF(certRef.current, `${safeName}_certificate`)
    if (!success) {
      alert("Download failed. Please try a screenshot instead.")
    }
    setDownloading(false)
  }

  function handleWhatsApp(p: Participant) {
    const text = `🏆 ${p.title} ${p.name} secured ${p.position} position in ${event.tournamentName}!\n\nScored ${p.points} points out of ${p.rounds || event.totalRounds} rounds in ${p.category} category.\n\n${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
  }

  function handleLinkedIn(p: Participant) {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer")
  }

  function handleShare(p: Participant) {
    const text = `${p.title} ${p.name} secured ${p.position} position in ${event.tournamentName}! Scored ${p.points} out of ${p.rounds || event.totalRounds} rounds in ${p.category} category.`
    if (navigator.share) {
      navigator.share({ title: event.tournamentName, text, url: window.location.href })
    } else {
      navigator.clipboard.writeText(text + "\n" + window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  function openCert(p: Participant) {
    setSelectedParticipant(p)
    setShowCert(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative bg-card border-b overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="chess-pub" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="20" height="20" fill="currentColor" />
                <rect x="20" y="20" width="20" height="20" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#chess-pub)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#d4af37]">
                <BrandKnight className="h-4 w-4 text-[#0f172a]" />
              </div>
              <span className="text-sm font-sans font-bold text-foreground">CertifySports</span>
            </div>
          </div>

          <div className="text-center">
            <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-0">
              <Trophy className="h-3 w-3 mr-1" />
              Official Results
            </Badge>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground text-balance">
              {event.tournamentName || "Chess Tournament"}
            </h1>
            {event.venue && (
              <p className="mt-2 text-muted-foreground text-sm">
                {event.venue}
                {event.startDate && (
                  <>
                    {" | "}
                    {event.startDate}
                    {!event.isSingleDay && event.endDate ? ` to ${event.endDate}` : ""}
                  </>
                )}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {participants.length} participants | {event.totalRounds} rounds
            </p>
          </div>

          <div className="mt-6 max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, category, or affiliation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 text-base bg-background border-border rounded-xl shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Search Results */}
        {search.trim() && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">
              {filtered.length === 0 ? "No results found" : `${filtered.length} result${filtered.length > 1 ? "s" : ""}`}
            </h2>
            <div className="space-y-2">
              {filtered.map((p, i) => (
                <Card key={i} className="p-4 hover:shadow-md transition-shadow cursor-pointer border" onClick={() => openCert(p)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0">
                        {getRankIcon(p.position)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{p.title} {p.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {p.affiliation && `${p.affiliation} | `}{p.category} | {p.points}/{p.rounds || event.totalRounds} pts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={parseInt(p.position) <= 3 ? "default" : "secondary"}
                        className={
                          parseInt(p.position) === 1 ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-500"
                            : parseInt(p.position) === 2 ? "bg-gray-300 text-gray-800 hover:bg-gray-300"
                              : parseInt(p.position) === 3 ? "bg-amber-600 text-amber-50 hover:bg-amber-600"
                                : ""
                        }
                      >
                        {p.position}
                      </Badge>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Top 3 Podium */}
        {!search.trim() && top3.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#d4af37]" />
              Top Performers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((p, i) => {
                const colors = [
                  "border-yellow-400 bg-yellow-50",
                  "border-gray-300 bg-gray-50",
                  "border-amber-500 bg-amber-50",
                ]
                const textColors = ["text-yellow-800", "text-gray-700", "text-amber-800"]
                const labels = ["1st Place", "2nd Place", "3rd Place"]
                return (
                  <Card
                    key={i}
                    className={`p-5 border-2 ${colors[i]} cursor-pointer hover:shadow-lg transition-all`}
                    onClick={() => openCert(p)}
                  >
                    <div className="text-center">
                      <div className="flex justify-center mb-2">{getRankIcon(p.position)}</div>
                      <p className={`text-xs font-medium uppercase tracking-wider ${textColors[i]}`}>{labels[i]}</p>
                      <p className="mt-1 font-bold text-foreground text-lg">{p.title} {p.name}</p>
                      {p.affiliation && <p className="text-sm text-muted-foreground mt-0.5 truncate">{p.affiliation}</p>}
                      <div className="mt-3 flex justify-center gap-2 flex-wrap">
                        <Badge variant="secondary">{p.category}</Badge>
                        <Badge variant="outline">{p.points}/{p.rounds || event.totalRounds} pts</Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="mt-3 text-primary">
                        <Eye className="h-4 w-4 mr-1" /> View Certificate
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Full Standings */}
        {!search.trim() && (
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">Full Standings</h2>
            <Card className="overflow-hidden border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rank</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Affiliation</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Score</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayStandings.map((p, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center">{getRankIcon(p.position)}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">{p.title} {p.name}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{p.affiliation || "-"}</td>
                        <td className="py-3 px-4"><Badge variant="secondary" className="font-normal">{p.category}</Badge></td>
                        <td className="py-3 px-4 text-center font-mono text-foreground">{p.points}/{p.rounds || event.totalRounds}</td>
                        <td className="py-3 px-4 text-center">
                          <Button size="sm" variant="ghost" className="text-primary" onClick={() => openCert(p)}>
                            <Eye className="h-4 w-4 mr-1" /><span className="hidden sm:inline">View</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sortedParticipants.length > 10 && (
                <div className="p-3 border-t text-center">
                  <Button variant="ghost" size="sm" onClick={() => setShowFullStandings(!showFullStandings)} className="text-muted-foreground">
                    {showFullStandings ? <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</> : <><ChevronDown className="h-4 w-4 mr-1" /> Show All {sortedParticipants.length}</>}
                  </Button>
                </div>
              )}
            </Card>
          </section>
        )}
      </div>

      {/* Certificate Modal */}
      <Dialog open={showCert} onOpenChange={setShowCert}>
        <DialogContent className="max-w-[860px] max-h-[95vh] overflow-y-auto p-4 md:p-6">
          {selectedParticipant && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground">
                    {selectedParticipant.title} {selectedParticipant.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedParticipant.position} position | {selectedParticipant.category} | {selectedParticipant.points}/{selectedParticipant.rounds || event.totalRounds} pts
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleShare(selectedParticipant)}>
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={downloading}
                    onClick={() => handleDownload(selectedParticipant)}
                  >
                    {downloading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                    {downloading ? "Saving..." : "Download PDF"}
                  </Button>
                </div>
              </div>

              {/* Certificate */}
              <div ref={certRef} className="border rounded-lg overflow-auto bg-white flex justify-center p-2">
                <CertificateRenderer
                  designId={selectedDesign}
                  participant={selectedParticipant}
                  event={event}
                  wordingTemplate={wordingTemplate}
                  signatories={signatories}
                  organizerLogo={organizerLogo}
                  sponsorLogos={sponsorLogos}
                  scale={1}
                  customColors={customColors}
                />
              </div>

              {/* Social share buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1 h-10 font-medium"
                  style={{ backgroundColor: "#25D366", color: "#ffffff" }}
                  onClick={() => handleWhatsApp(selectedParticipant)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Share on WhatsApp
                </Button>
                <Button
                  className="flex-1 h-10 font-medium"
                  style={{ backgroundColor: "#0A66C2", color: "#ffffff" }}
                  onClick={() => handleLinkedIn(selectedParticipant)}
                >
                  <Linkedin className="h-4 w-4 mr-2" /> Share on LinkedIn
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
