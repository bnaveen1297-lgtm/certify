"use client"

import { useCallback } from "react"
import { ImagePlus, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface LogoUploaderProps {
  organizerLogo: string | null
  sponsorLogos: string[]
  onOrganizerLogoChange: (url: string | null) => void
  onSponsorLogosChange: (urls: string[]) => void
}

export function LogoUploader({ organizerLogo, sponsorLogos, onOrganizerLogoChange, onSponsorLogosChange }: LogoUploaderProps) {

  const handleSingleUpload = useCallback((callback: (url: string) => void) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => callback(ev.target?.result as string)
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }, [])

  /* Batch upload: user selects multiple files at once */
  const handleBatchSponsorUpload = useCallback(() => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      const maxSlots = 6 - sponsorLogos.length
      const toProcess = files.slice(0, maxSlots)
      const results: string[] = []
      let done = 0
      toProcess.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          results.push(ev.target?.result as string)
          done++
          if (done === toProcess.length) {
            onSponsorLogosChange([...sponsorLogos, ...results])
          }
        }
        reader.readAsDataURL(file)
      })
    }
    input.click()
  }, [sponsorLogos, onSponsorLogosChange])

  return (
    <div className="space-y-4">
      <h3 className="font-display text-base font-semibold text-foreground">Logos</h3>

      {/* Organizer Logo */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Organizer Logo (appears top-left on certificate)</Label>
        <p className="text-xs text-muted-foreground -mt-1">This is the main organizing body's logo</p>
        {organizerLogo ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-primary/20">
            <img src={organizerLogo} alt="Organizer logo" className="h-12 w-12 object-contain rounded" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Organizer logo uploaded</p>
              <p className="text-xs text-muted-foreground">Displayed on the top-left of the certificate</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOrganizerLogoChange(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => handleSingleUpload((url) => onOrganizerLogoChange(url))}
            className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload organizer logo</span>
          </button>
        )}
      </div>

      {/* Sponsor Logos - batch upload */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Sponsor / Association Logos (appears top-right, up to 6)</Label>
          <span className="text-xs text-muted-foreground">{sponsorLogos.length}/6</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sponsorLogos.map((logo, i) => (
            <div key={i} className="relative group">
              <img src={logo} alt={`Sponsor ${i + 1}`} className="h-14 w-14 object-contain rounded border border-border p-1" />
              <button
                onClick={() => onSponsorLogosChange(sponsorLogos.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        {sponsorLogos.length < 6 && (
          <button
            onClick={handleBatchSponsorUpload}
            className="flex items-center justify-center gap-2 w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Upload sponsor logos (select multiple files at once)
            </span>
          </button>
        )}
        <p className="text-xs text-muted-foreground">Select multiple files in the file picker to upload all logos in one go. These appear at the top of the certificate.</p>
      </div>
    </div>
  )
}
