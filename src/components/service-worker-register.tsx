"use client"

import { useEffect } from "react"

/** Registers `/public/sw.js` in production builds only (offline + install). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((err) => {
      console.warn("[sw] registration failed:", err)
    })
  }, [])

  return null
}
