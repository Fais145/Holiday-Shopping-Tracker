"use client"

import { motion } from "framer-motion"
import { Calendar, MapPin, Plus, Search, Settings, ShoppingBag } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "today", label: "Today", icon: Calendar },
  { id: "stores", label: "Stores", icon: MapPin },
  { id: "add", label: "Add", icon: Plus, isAction: true },
  { id: "search", label: "Lookup", icon: Search },
  { id: "bought", label: "Haul", icon: ShoppingBag },
]

export function BottomNav() {
  const { activeTab, setActiveTab, items } = useAppStore()
  
  const huntingCount = items.filter((i) => i.status === "hunting").length
  const boughtCount = items.filter((i) => i.status === "bought").length

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 pb-safe"
    >
      <div className="flex items-center justify-around h-18 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const count = item.id === "today" ? huntingCount : item.id === "bought" ? boughtCount : 0

          if (item.isAction) {
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab(item.id)}
                className="flex items-center justify-center -mt-6 size-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/30 ring-4 ring-background"
                aria-label={item.label}
              >
                <Icon className="size-6" strokeWidth={2.5} />
              </motion.button>
            )
          }

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 h-full px-4 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  className={cn("size-5 transition-all", isActive && "scale-110")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center size-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 inset-x-2 h-0.5 bg-primary rounded-full"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}

export function SettingsButton() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab("settings")}
      className={cn(
        "flex items-center justify-center size-10 rounded-full transition-all",
        activeTab === "settings"
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-secondary/80 text-secondary-foreground hover:bg-secondary"
      )}
      aria-label="Settings"
    >
      <Settings className="size-5" />
    </motion.button>
  )
}
