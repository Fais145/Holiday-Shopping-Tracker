"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Plus, Search, Settings, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"
import { isQuestComplete, showsOnTodayView, useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const leftNavItems = [{ href: "/stores", label: "Stores", icon: MapPin }]
const centerNavItem = { href: "/add", label: "Add", icon: Plus }
const rightNavItems = [
  { href: "/search", label: "Lookup", icon: Search },
  { href: "/haul", label: "Haul", icon: ShoppingBag },
]

export function BottomNav() {
  const pathname = usePathname() ?? ""
  const items = useAppStore((s) => s.items)

  const huntingCount = items.filter((i) => showsOnTodayView(i)).length
  const boughtCount = items.filter((i) => isQuestComplete(i)).length

  function isNavActive(href: string): boolean {
    if (href === "/stores") return pathname.startsWith("/stores")
    return pathname === href
  }

  function renderNavLink(item: (typeof leftNavItems)[0]) {
    const Icon = item.icon
    const isActive = isNavActive(item.href)
    const count =
      item.href === "/stores"
        ? huntingCount
        : item.href === "/haul"
          ? boughtCount
          : 0

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch
        aria-label={item.label}
        className={cn(
          "relative flex min-w-0 shrink-0 flex-col items-center justify-center gap-0.5 px-2 py-2 transition-colors",
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
            className="absolute inset-x-1 top-0 h-0.5 rounded-full bg-primary"
          />
        )}
      </Link>
    )
  }

  const CenterIcon = centerNavItem.icon

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-card/95 pb-safe backdrop-blur-xl"
    >
      <div className="mx-auto flex h-18 max-w-lg items-end justify-center gap-5 px-3 pb-2 pt-1 sm:gap-6 sm:px-4">
        {leftNavItems.map((item) => renderNavLink(item))}
        <div className="relative z-10 flex shrink-0 flex-col items-center gap-0.5 px-2 py-2 translate-y-4 sm:translate-y-0">
          <Link href={centerNavItem.href} prefetch aria-label={centerNavItem.label}>
            <motion.span
              whileTap={{ scale: 0.9 }}
              className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/30 ring-4 ring-background"
            >
              <CenterIcon className="size-6" strokeWidth={2.5} />
            </motion.span>
          </Link>
          <span className="text-[10px] font-medium leading-none invisible select-none" aria-hidden>
            Add
          </span>
        </div>
        {rightNavItems.map((item) => renderNavLink(item))}
      </div>
    </motion.nav>
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
