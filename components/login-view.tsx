"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Trophy, ExternalLink, Users, MapPin, Calendar } from "lucide-react"
import type { TournamentRecord } from "@/lib/tournament-history"

interface LoginViewProps {
  onLogin: (email: string) => void
  tournamentHistory: TournamentRecord[]
  onViewTournament: (record: TournamentRecord) => void
}

/* Chess piece SVGs for decoration */
function ChessKingSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L10 6H8L6 2H4L6 8H3V10H6L4 16H3V18H6L8 22H16L18 18H21V16H20L18 10H21V8H18L20 2H18L16 6H14L12 2Z" />
    </svg>
  )
}

function ChessKnightSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 22H5V20H7L8 18C4.5 17.5 3 14 3 11C3 7.5 5.5 5 8 4L7 2H10L11 4C12 3.5 13.5 3.5 14 4L15 2H18L17 4C19.5 5.5 21 8 21 11C21 14 19.5 17.5 16 18L17 20H19V22ZM10 8C9 8 7 9 7 11C7 13 9 15 12 15C15 15 17 13 17 11C17 9 15 8 14 8H10Z" />
    </svg>
  )
}

function ChessRookSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M5 20H19V18H18V8H19V6H16V3H14V6H10V3H8V6H5V8H6V18H5V20ZM8 8H16V18H8V8Z" />
    </svg>
  )
}

function ChessBoardPattern() {
  const rows = 8
  const cols = 8
  return (
    <div className="absolute inset-0 opacity-[0.06]">
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const row = Math.floor(i / cols)
          const col = i % cols
          const isDark = (row + col) % 2 === 1
          return <div key={i} className={isDark ? "bg-white" : ""} />
        })}
      </div>
    </div>
  )
}

export function LoginView({ onLogin, tournamentHistory, onViewTournament }: LoginViewProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [orgName, setOrgName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin(email || "organizer@chess.org")
    }, 800)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Chess themed */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f172a]">
        <ChessBoardPattern />

        {/* Floating chess pieces */}
        <div className="absolute inset-0 pointer-events-none">
          <ChessKingSVG className="absolute top-[12%] left-[10%] w-16 h-16 text-white/[0.07] rotate-[-10deg]" />
          <ChessKnightSVG className="absolute top-[30%] right-[15%] w-20 h-20 text-white/[0.06] rotate-[15deg]" />
          <ChessRookSVG className="absolute bottom-[20%] left-[20%] w-14 h-14 text-white/[0.08] rotate-[5deg]" />
          <ChessKingSVG className="absolute bottom-[35%] right-[10%] w-12 h-12 text-white/[0.05] rotate-[-20deg]" />
          <ChessKnightSVG className="absolute top-[60%] left-[5%] w-10 h-10 text-white/[0.05] rotate-[30deg]" />
        </div>

        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#d4af37]" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]">
              <ChessKnightSVG className="h-7 w-7 text-[#0f172a]" />
            </div>
            <span className="text-2xl font-bold font-display text-white tracking-tight">CertifySports</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold font-display text-white leading-tight text-balance mb-4">
            Chess Tournament Certificates, Simplified.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed max-w-md mb-2">
            Upload your participant data, pick a design, customize the wording, and generate professional certificates for every player.
          </p>
          <p className="text-sm text-[#d4af37]/80 italic font-serif">
            {'"Every pawn is a potential queen." - James Mason'}
          </p>

          {/* Stats */}
          <div className="mt-12 flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold font-display text-[#d4af37]">20</p>
              <p className="text-sm text-white/60">Designs</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold font-display text-[#d4af37]">3</p>
              <p className="text-sm text-white/60">Wording Templates</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-bold font-display text-[#d4af37]">CSV</p>
              <p className="text-sm text-white/60">Upload Ready</p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              "Upload CSV with points, position, category",
              "20 chess-themed certificate designs",
              "Custom wording with {placeholders}",
              "Share via WhatsApp & LinkedIn",
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />
                <span className="text-sm text-white/60">{feat}</span>
              </div>
            ))}
          </div>

          {/* Published Tournament History */}
          {tournamentHistory.length > 0 && (
            <div className="mt-10">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Recent Tournaments</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {tournamentHistory.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onViewTournament(t)}
                    className="flex items-start gap-3 w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#d4af37]/20 shrink-0 mt-0.5">
                      <Trophy className="h-4 w-4 text-[#d4af37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{t.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-white/50">
                          <MapPin className="h-3 w-3" />{t.venue}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/50">
                          <Users className="h-3 w-3" />{t.participantCount}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/50">
                          <Calendar className="h-3 w-3" />{t.date}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-white/30 shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]">
              <ChessKnightSVG className="h-6 w-6 text-[#0f172a]" />
            </div>
            <span className="text-xl font-bold font-display text-foreground tracking-tight">CertifySports</span>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 border-b border-border">
            <button
              onClick={() => setTab("signin")}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === "signin" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors border-b-2 ${
                tab === "signup" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {tab === "signin" ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-display text-foreground tracking-tight">Welcome back</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to your organizer dashboard</p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                  <Input id="signin-email" type="email" placeholder="organizer@chess.org" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 bg-card" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                    <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Input id="signin-password" type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 pr-10 bg-card" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="h-10 w-full mt-2 font-semibold" disabled={isLoading}>
                  {isLoading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />Signing in...</span> : "Sign In"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-display text-foreground tracking-tight">Create account</h2>
                <p className="mt-1 text-sm text-muted-foreground">Set up your organizer account to start creating certificates</p>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="org-name" className="text-sm font-medium">Organization Name</Label>
                  <Input id="org-name" type="text" placeholder="e.g. District Chess Association" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="h-10 bg-card" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <Input id="signup-email" type="email" placeholder="organizer@chess.org" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 bg-card" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 pr-10 bg-card" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10 bg-card" />
                </div>
                <Button type="submit" className="h-10 w-full mt-2 font-semibold" disabled={isLoading}>
                  {isLoading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />Creating account...</span> : "Create Account"}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            {"By continuing, you agree to our Terms of Service and Privacy Policy."}
          </p>
        </div>
      </div>
    </div>
  )
}
