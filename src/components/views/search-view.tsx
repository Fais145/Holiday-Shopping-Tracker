"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ItemBrowseView } from "@/components/item-browse-view"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"

const LOOKUP_ZERO_HINT_DISMISSED = "yv-lookup-zero-hint-dismissed"

export function SearchView() {
  const items = useAppStore((s) => s.items)
  const [welcomeOpen, setWelcomeOpen] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      if (items.length > 0) {
        try {
          sessionStorage.removeItem(LOOKUP_ZERO_HINT_DISMISSED)
        } catch {
          /* ignore */
        }
        setWelcomeOpen(false)
        return
      }
      try {
        if (sessionStorage.getItem(LOOKUP_ZERO_HINT_DISMISSED) === "1") {
          setWelcomeOpen(false)
          return
        }
      } catch {
        /* ignore */
      }
      setWelcomeOpen(true)
    })
  }, [items.length])

  const handleOpenChange = (open: boolean) => {
    setWelcomeOpen(open)
    if (!open && items.length === 0) {
      try {
        sessionStorage.setItem(LOOKUP_ZERO_HINT_DISMISSED, "1")
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <>
      <Dialog open={welcomeOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Start your quest log</DialogTitle>
            <DialogDescription className="text-base text-foreground leading-relaxed pt-1">
              Press <span className="font-semibold">+</span> below to create your first item, or go to
              Settings to try sample data :)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 border-0 bg-transparent p-0 sm:flex-col">
            <Button asChild variant="outline" className="h-12 w-full rounded-xl font-semibold">
              <Link href="/settings" prefetch>
                Open Settings
              </Link>
            </Button>
            <Button
              type="button"
              className="h-12 w-full rounded-xl font-semibold"
              onClick={() => handleOpenChange(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ItemBrowseView
        title="Item Lookup"
        subtitle="Find any item and see where else you can get it"
        omitZeroItemsCard
      />
    </>
  )
}
