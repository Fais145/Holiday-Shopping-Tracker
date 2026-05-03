"use client"

import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-svh flex flex-col bg-background">
      {/* Cute strawberry tiling — faint so cards & text stay easy to read (hidden in dark mode). */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 dark:hidden">
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "url(/bg-strawberry-pattern.png)",
            backgroundRepeat: "repeat",
            backgroundSize: "clamp(260px, 82vw, 400px)",
          }}
        />
      </div>
      <div className="relative z-[1] flex min-h-svh flex-col">
        <AppHeader />
        <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full min-h-0">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
