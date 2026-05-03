"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type RecipientPickerProps = {
  value: string
  onChange: (next: string) => void
  /** Unique trimmed names derived from existing items — sorted for display */
  suggestions: readonly string[]
  inputId?: string
}

export function RecipientPicker({
  value,
  onChange,
  suggestions,
  inputId = "recipient-picker-input",
}: RecipientPickerProps) {
  const [newRecipientLabel, setNewRecipientLabel] = useState("")
  const trimmedLower = value.trim().toLowerCase()

  const commitNewRecipient = () => {
    const t = newRecipientLabel.trim()
    if (!t) return
    onChange(t)
    setNewRecipientLabel("")
  }

  const clearDraft = () => setNewRecipientLabel("")

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold">
        Who&apos;s it for? <span className="text-muted-foreground font-normal">(optional)</span>
      </label>
      <p className="text-xs text-muted-foreground -mt-2">
        Tap a name you&apos;ve used before, or add a new one — same idea as categories below.
      </p>
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((name) => {
            const selected = trimmedLower !== "" && trimmedLower === name.trim().toLowerCase()
            return (
              <motion.button
                key={name}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  clearDraft()
                  if (selected) {
                    onChange("")
                  } else {
                    onChange(name)
                  }
                }}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  selected ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                )}
              >
                {name}
              </motion.button>
            )
          })}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor={inputId} className="text-xs font-semibold text-muted-foreground">
            New recipient
          </label>
          <Input
            id={inputId}
            placeholder="Cousin, neighbour…"
            value={newRecipientLabel}
            onChange={(e) => setNewRecipientLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                commitNewRecipient()
              }
            }}
            className="h-11 rounded-xl text-base"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 rounded-xl font-semibold"
          disabled={!newRecipientLabel.trim()}
          onClick={commitNewRecipient}
        >
          Add recipient
        </Button>
      </div>
      {value.trim() ? (
        <p className="text-xs text-muted-foreground rounded-xl bg-muted/40 px-3 py-2">
          Selected: <span className="font-medium text-foreground">{value.trim()}</span>
          {" · "}
          <button
            type="button"
            className="underline underline-offset-2 font-medium text-foreground hover:text-primary"
            onClick={() => {
              clearDraft()
              onChange("")
            }}
          >
            Clear
          </button>
        </p>
      ) : null}
    </div>
  )
}
