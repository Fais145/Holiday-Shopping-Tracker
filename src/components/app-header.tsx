"use client"

import { usePathname } from "next/navigation"
import { ChevronLeft, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppBackNavigation } from "@/hooks/use-app-back-navigation"
import { useAppStore } from "@/lib/store"
import { SettingsButton } from "@/components/bottom-nav"

const PATH_META: Record<string, { title: string; subtitle?: string }> = {
  "/stores": { title: "Stores", subtitle: "Pick where you’re shopping" },
  "/add": { title: "Add Item", subtitle: "Log something new" },
  "/search": { title: "Lookup", subtitle: "Search your quest" },
  "/haul": { title: "Haul", subtitle: "Your treasures" },
}

export function AppHeader() {
  const pathname = usePathname() ?? ""
  const stores = useAppStore((s) => s.stores)
  const backFromStore = useAppBackNavigation("/stores")

  if (pathname.startsWith("/settings")) {
    return null
  }

  const storeDetailMatch = /^\/stores\/([^/]+)\/?$/.exec(pathname)

  if (storeDetailMatch?.[1]) {
    const id = decodeURIComponent(storeDetailMatch[1])
    const store = stores.find((s) => s.id === id)
    const title = store?.name ?? "Store"
    const subtitle = [store?.area, store?.hours].filter(Boolean).join(" · ")

    return (
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            onClick={() => backFromStore()}
            aria-label="Go back"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold leading-tight truncate">{title}</h1>
            {subtitle ? (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            ) : null}
          </div>
          <SettingsButton />
        </div>
      </header>
    )
  }

  const meta = PATH_META[pathname]

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 shrink-0">
          {pathname.startsWith("/stores") ? (
            <MapPin className="size-5 text-primary" aria-hidden />
          ) : (
            <Sparkles className="size-5 text-primary" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold leading-tight truncate">
            {meta?.title ?? "Japan Buy Quest"}
          </h1>
          {meta?.subtitle && (
            <p className="text-xs text-muted-foreground truncate">{meta.subtitle}</p>
          )}
        </div>
        <SettingsButton />
      </div>
    </header>
  )
}
