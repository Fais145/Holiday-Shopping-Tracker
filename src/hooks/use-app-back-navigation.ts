"use client"

import { useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"

function stripTrailingSlash(p: string): string {
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1)
  return p
}

/** Go to actual browser history prev step; fall back when there is nowhere to go. */
export function useAppBackNavigation(fallbackHref = "/stores") {
  const router = useRouter()
  const pathname = usePathname()

  return useCallback(() => {
    const pathBefore = stripTrailingSlash((pathname ?? "/").split("?")[0] || "/")

    router.back()

    window.setTimeout(() => {
      const nextPath = stripTrailingSlash(window.location.pathname || "/")
      if (nextPath === pathBefore) {
        router.push(fallbackHref)
      }
    }, 520)
  }, [pathname, router, fallbackHref])
}
