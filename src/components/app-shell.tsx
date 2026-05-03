"use client"

import { MapPin, Sparkles } from "lucide-react"
import { BottomNav, SettingsButton } from "@/components/bottom-nav"
import { AddItemView } from "@/components/views/add-item-view"
import { BoughtView } from "@/components/views/bought-view"
import { SearchView } from "@/components/views/search-view"
import { SettingsView } from "@/components/views/settings-view"
import { StoresView } from "@/components/views/stores-view"
import { TodayView } from "@/components/views/today-view"
import { useAppStore } from "@/lib/store"

const viewTitles: Record<string, { title: string; subtitle?: string }> = {
  today: { title: "Today", subtitle: "Your quest awaits" },
  stores: { title: "Stores", subtitle: "Plan your route" },
  add: { title: "Add Item" },
  search: { title: "Search", subtitle: "Find anything" },
  bought: { title: "Haul", subtitle: "Your treasures" },
  settings: { title: "Settings" },
}

export function AppShell() {
  const { activeTab } = useAppStore()
  const currentView = viewTitles[activeTab] || viewTitles.today

  return (
    <div className="min-h-svh flex flex-col bg-background">
      {/* Header */}
      {activeTab !== "settings" && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                {activeTab === "stores" ? (
                  <MapPin className="size-5 text-primary" />
                ) : (
                  <Sparkles className="size-5 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold leading-tight">{currentView.title}</h1>
                {currentView.subtitle && (
                  <p className="text-xs text-muted-foreground">{currentView.subtitle}</p>
                )}
              </div>
            </div>
            <SettingsButton />
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {activeTab === "today" && <TodayView />}
        {activeTab === "stores" && <StoresView />}
        {activeTab === "add" && <AddItemView />}
        {activeTab === "search" && <SearchView />}
        {activeTab === "bought" && <BoughtView />}
        {activeTab === "settings" && <SettingsView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
