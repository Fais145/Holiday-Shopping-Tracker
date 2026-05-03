"use client"

import { Calendar, MapPin, Plus, Search, Settings, ShoppingBag } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "today", label: "Today", icon: Calendar },
  { id: "stores", label: "Stores", icon: MapPin },
  { id: "add", label: "Add", icon: Plus, isAction: true },
  { id: "search", label: "Search", icon: Search },
  { id: "bought", label: "Bought", icon: ShoppingBag },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex items-center justify-center -mt-4 size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
                aria-label={item.label}
              >
                <Icon className="size-6" strokeWidth={2.5} />
              </button>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 h-full px-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn("size-5 transition-all", isActive && "scale-110")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function SettingsButton() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <button
      onClick={() => setActiveTab("settings")}
      className={cn(
        "flex items-center justify-center size-10 rounded-full transition-colors",
        activeTab === "settings"
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground"
      )}
      aria-label="Settings"
    >
      <Settings className="size-5" />
    </button>
  )
}
