"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { storePagePath } from "@/lib/routes"
import { cn } from "@/lib/utils"

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1)
  }
  return path
}

export type SmartStoreLinkProps = {
  storeId: string
  prefetch?: boolean
  className?: string
  children: React.ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">

/** When already viewing `/stores/[storeId]` for this shop, renders a non-navigating span. */
export const SmartStoreLink = React.forwardRef<
  HTMLAnchorElement | HTMLSpanElement,
  SmartStoreLinkProps
>(function SmartStoreLink(
  { storeId, className, children, prefetch, ...anchorRest },
  ref
) {
  const pathname = normalizePath(usePathname() ?? "")
  const href = normalizePath(storePagePath(storeId))
  const isHere = pathname === href

  if (isHere) {
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={cn(className)}
        aria-current="page"
      >
        {children}
      </span>
    )
  }

  return (
    <Link
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={storePagePath(storeId)}
      prefetch={prefetch ?? true}
      className={className}
      {...anchorRest}
    >
      {children}
    </Link>
  )
})

SmartStoreLink.displayName = "SmartStoreLink"
