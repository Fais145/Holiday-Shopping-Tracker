"use client"

import { useSyncExternalStore } from "react"
import { WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb)
  window.addEventListener("offline", cb)
  return () => {
    window.removeEventListener("online", cb)
    window.removeEventListener("offline", cb)
  }
}

export function OfflineNotice() {
  const offline = useSyncExternalStore(
    subscribeOnline,
    () => !navigator.onLine,
    () => false
  )

  if (!offline) return null

  return (
    <div
      role="status"
      className={cn(
        "shrink-0 border-b border-amber-500/35 bg-amber-500/10 px-4 py-2",
        "text-center text-xs text-amber-950 dark:text-amber-100 dark:bg-amber-500/15"
      )}
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-1.5">
        <WifiOff className="size-3.5 shrink-0 opacity-90" aria-hidden />
        <span>
          You&apos;re offline — lists and local data still work here. Links to Google Maps won&apos;t load
          until you&apos;re back online.
        </span>
      </span>
    </div>
  )
}
