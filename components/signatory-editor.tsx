"use client"

import { useCallback } from "react"
import { Plus, Trash2, ImagePlus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { Signatory } from "@/lib/certificate-wording"

interface SignatoryEditorProps {
  signatories: Signatory[]
  onChange: (signatories: Signatory[]) => void
}

export function SignatoryEditor({ signatories, onChange }: SignatoryEditorProps) {
  const addSignatory = () => {
    if (signatories.length >= 5) return
    onChange([...signatories, { name: "", designation: "", signatureImage: null }])
  }

  const removeSignatory = (index: number) => {
    onChange(signatories.filter((_, i) => i !== index))
  }

  const updateSignatory = (index: number, field: keyof Signatory, value: string | null) => {
    const updated = [...signatories]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleSignatureUpload = useCallback((index: number) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          updateSignatory(index, "signatureImage", ev.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }, [signatories, onChange])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-foreground">Signatories</h3>
        <span className="text-xs text-muted-foreground">{signatories.length}/5</span>
      </div>

      <div className="space-y-3">
        {signatories.map((sig, i) => (
          <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input
                    value={sig.name}
                    onChange={(e) => updateSignatory(i, "name", e.target.value)}
                    placeholder="e.g. Mr. Sheikh Sattar"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Designation</Label>
                  <Input
                    value={sig.designation}
                    onChange={(e) => updateSignatory(i, "designation", e.target.value)}
                    placeholder="e.g. President, AGCA"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-5 h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeSignatory(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Signature photo upload */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Signature Photo (optional)</Label>
              {sig.signatureImage ? (
                <div className="flex items-center gap-3">
                  <img src={sig.signatureImage} alt="Signature" className="h-10 object-contain rounded border border-border bg-white px-2" />
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={() => updateSignatory(i, "signatureImage", null)}>
                    <X className="h-3 w-3" /> Remove
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => handleSignatureUpload(i)}
                  className="flex items-center gap-2 px-3 py-2 rounded border border-dashed border-border hover:border-primary/50 hover:bg-secondary/30 transition-colors cursor-pointer text-xs text-muted-foreground"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Upload signature image
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {signatories.length < 5 && (
        <Button variant="outline" size="sm" onClick={addSignatory} className="w-full gap-2">
          <Plus className="h-3.5 w-3.5" />
          Add Signatory
        </Button>
      )}
      <p className="text-xs text-muted-foreground">Add up to 5 signatories with optional signature photo (President, Secretary, Chief Arbiter, Tournament Director, etc.)</p>
    </div>
  )
}
