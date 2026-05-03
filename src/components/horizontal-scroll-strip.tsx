"use client"

import { useRef, type ReactNode } from "react"
import { useHorizontalGrabScroll } from "@/hooks/use-horizontal-grab-scroll"
import { cn } from "@/lib/utils"

/**
 * Horizontal overflow with hidden scrollbars; mouse users can drag to scroll; touch uses native pan-x.
 */
export function HorizontalScrollStrip({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useHorizontalGrabScroll(ref)
  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1 -mx-1 px-1 touch-pan-x",
        className
      )}
    >
      {children}
    </div>
  )
}
