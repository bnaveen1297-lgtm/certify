"use client"

import { useCallback, useState } from "react"
import { Upload, FileSpreadsheet, AlertCircle, Download, HelpCircle, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CSV_FIELDS, parseCSV } from "@/lib/csv-fields"
import { SAMPLE_CSV } from "@/lib/mock-participants"
import type { Participant } from "@/lib/csv-fields"

interface CSVUploadProps {
  participants: Participant[]
  onUpload: (participants: Participant[]) => void
}

export function CSVUpload({ participants, onUpload }: CSVUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback((file: File) => {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const parsed = parseCSV(text)
        if (parsed.length === 0) {
          setError("No valid rows found. Check that your CSV has the correct headers.")
          return
        }
        onUpload(parsed)
      } catch {
        setError("Failed to parse CSV. Please check the format.")
      }
    }
    reader.readAsText(file)
  }, [onUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      processFile(file)
    } else {
      setError("Please upload a .csv file")
    }
  }, [processFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample_chess_tournament.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-foreground">Upload Participant Data</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5" />
              CSV Format Guide
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Expected CSV Columns</h4>
              <div className="space-y-2">
                {CSV_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-start gap-2">
                    <Badge variant={field.required ? "default" : "secondary"} className="text-xs shrink-0 mt-0.5">
                      {field.required ? "Required" : "Optional"}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{field.label}</p>
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                      <p className="text-xs text-muted-foreground/70">{"Example: "}{field.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Upload zone */}
      {participants.length === 0 && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drag and drop your CSV file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click below to browse</p>
            </div>
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  <FileSpreadsheet className="h-4 w-4" />
                  Choose CSV File
                </span>
              </label>
              <Button variant="outline" size="sm" onClick={downloadSample} className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Sample CSV
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </>
      )}

      {/* Data preview table */}
      {participants.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-chart-4" />
              <span className="text-sm font-medium text-foreground">{participants.length} participants loaded</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => onUpload([])} className="gap-1.5 text-xs">
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
          <div className="rounded-lg border border-border overflow-hidden max-h-72 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-xs font-semibold w-8">#</TableHead>
                  <TableHead className="text-xs font-semibold">Title</TableHead>
                  <TableHead className="text-xs font-semibold">Name</TableHead>
                  <TableHead className="text-xs font-semibold">Gender</TableHead>
                  <TableHead className="text-xs font-semibold">Affiliation</TableHead>
                  <TableHead className="text-xs font-semibold">Pts</TableHead>
                  <TableHead className="text-xs font-semibold">Rds</TableHead>
                  <TableHead className="text-xs font-semibold">Pos.</TableHead>
                  <TableHead className="text-xs font-semibold">Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p, i) => (
                  <TableRow key={i} className="text-xs">
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>{p.title || <span className="text-destructive">--</span>}</TableCell>
                    <TableCell className="font-medium">{p.name || <span className="text-destructive">Missing</span>}</TableCell>
                    <TableCell>{p.gender || "--"}</TableCell>
                    <TableCell className="max-w-[160px] truncate">{p.affiliation || "--"}</TableCell>
                    <TableCell className="font-mono">{p.points || "--"}</TableCell>
                    <TableCell className="font-mono">{p.rounds || "--"}</TableCell>
                    <TableCell className="font-semibold">{p.position || "--"}</TableCell>
                    <TableCell>{p.category || "--"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
