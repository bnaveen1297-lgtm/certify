"use client"

import { WORDING_TEMPLATES, extractPlaceholders } from "@/lib/certificate-wording"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface WordingEditorProps {
  selectedTemplateId: string
  customWording: string
  onTemplateChange: (id: string) => void
  onWordingChange: (text: string) => void
}

export function WordingEditor({ selectedTemplateId, customWording, onTemplateChange, onWordingChange }: WordingEditorProps) {
  const placeholders = extractPlaceholders(customWording)

  const handleTemplateSelect = (id: string) => {
    onTemplateChange(id)
    const template = WORDING_TEMPLATES.find(t => t.id === id)
    if (template) {
      onWordingChange(template.text)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-foreground">Certificate Wording</h3>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Base Template</Label>
        <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a wording template" />
          </SelectTrigger>
          <SelectContent>
            {WORDING_TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Edit Wording</Label>
        <Textarea
          value={customWording}
          onChange={(e) => onWordingChange(e.target.value)}
          rows={4}
          className="text-sm font-sans leading-relaxed resize-none"
          placeholder="Type your certificate wording here. Use {Placeholder} syntax for dynamic fields."
        />
        <p className="text-xs text-muted-foreground">
          {"Use {curly braces} for dynamic fields that auto-fill from CSV and event data."}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Detected Placeholders</Label>
        <div className="flex flex-wrap gap-1.5">
          {placeholders.map((p) => (
            <Badge key={p} variant="secondary" className="text-xs font-mono">
              {p}
            </Badge>
          ))}
          {placeholders.length === 0 && (
            <span className="text-xs text-muted-foreground">{"No placeholders found. Add {Field Name} to your text."}</span>
          )}
        </div>
      </div>
    </div>
  )
}
