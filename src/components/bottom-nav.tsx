"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Plus, Search, Settings, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { isQuestComplete, showsOnTodayView, useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/stores", label: "Stores", icon: MapPin },
  { href: "/search", label: "Lookup", icon: Search },
  { href: "/haul", label: "Haul", icon: ShoppingBag },
]

/** Sits just above the bottom tab bar (clears nav + safe area). */
function FloatingAddButton() {
  const pathname = usePathname() ?? ""
  const isAdd = pathname === "/add"

  return (
    <Link
      href="/add"
      prefetch
      aria-label="Add item"
      className={cn(
        "fixed right-4 z-60 flex size-14 items-center justify-center rounded-full text-primary-foreground ring-4 ring-background sm:size-15",
        "bg-linear-to-br from-primary to-primary/80 shadow-xl shadow-primary/30",
        "motion-safe:transition-[box-shadow,transform] motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]",
        isAdd && "ring-primary/35 shadow-primary/40"
      )}
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)",
      }}
    >
      <motion.span
        whileTap={{ scale: 0.92 }}
        className="flex size-full items-center justify-center rounded-[inherit]"
      >
        <Plus className="size-7 sm:size-8" strokeWidth={2.5} aria-hidden />
      </motion.span>
    </Link>
  )
}

export function BottomNav() {
  const pathname = usePathname() ?? ""
  const items = useAppStore((s) => s.items)

  const huntingCount = items.filter((i) => showsOnTodayView(i)).length
  const boughtCount = items.filter((i) => isQuestComplete(i)).length

  function isNavActive(href: string): boolean {
    if (href === "/stores") return pathname.startsWith("/stores")
    return pathname === href
  }

  function renderNavLink(item: (typeof navItems)[number]) {
    const Icon = item.icon
    const isActive = isNavActive(item.href)
    const count =
      item.href === "/stores" ? huntingCount : item.href === "/haul" ? boughtCount : 0

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch
        aria-label={item.label}
        className={cn(
          "relative flex min-w-0 max-w-26 flex-1 flex-col items-center justify-center gap-0.5 px-3 py-2 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        <div className="relative">
          <Icon
            className={cn("size-5 transition-all", isActive && "scale-110")}
            strokeWidth={isActive ? 2.5 : 2}
            aria-hidden
          />
          {count > 0 && (
            <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </div>
        <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
          {item.label}
        </span>
        {isActive && (
          <motion.span
            layoutId="nav-indicator"
            className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-primary"
          />
        )}
      </Link>
    )
  }

  return (
    <>
      <FloatingAddButton />
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-card/95 pb-safe backdrop-blur-xl"
      >
        <div className="mx-auto flex h-18 max-w-lg items-center justify-center gap-2 px-4 pb-2 pt-2 sm:gap-4">
          {navItems.map((item) => renderNavLink(item))}
        </div>
      </motion.nav>
    </>
  )
}

export function SettingsButton() {
  const pathname = usePathname() ?? ""
  const isSettings = pathname.startsWith("/settings")

  return (
    <Link
      href="/settings"
      prefetch
      aria-label="Settings"
      className={cn(
        "flex items-center justify-center size-10 rounded-full transition-all shrink-0 outline-none focus-visible:border focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        isSettings
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-secondary/80 text-secondary-foreground hover:bg-secondary"
      )}
    >
      <Settings className="size-5" aria-hidden />
    </Link>
  )
}
