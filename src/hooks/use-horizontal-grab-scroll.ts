"use client"

import { type RefObject, useEffect } from "react"

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      "button, a, input, textarea, select, option, label, summary, [role='button'], [role='tab'], [role='link']"
    )
  )
}

/**
 * Pointer-drag to scroll horizontally (desktop trackpad/mouse).
 * Touches taps and clicks on pills/links must not be swallowed — skip grab there and skip this hook entirely on coarse pointers.
 */
export function useHorizontalGrabScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const finePointerOnly =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: fine)").matches

    if (!finePointerOnly) {
      el.style.touchAction = "pan-x"
      return
    }

    let active = false
    let pointerId: number | null = null
    let startX = 0
    let scrollLeftStart = 0

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return
      if (!el.contains(e.target as Node)) return
      if (isInteractiveTarget(e.target)) return
      active = true
      pointerId = e.pointerId
      startX = e.clientX
      scrollLeftStart = el.scrollLeft
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      el.style.cursor = "grabbing"
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!active || pointerId !== e.pointerId) return
      const dx = e.clientX - startX
      el.scrollLeft = scrollLeftStart - dx
    }

    const end = (e: PointerEvent) => {
      if (!active || pointerId !== e.pointerId) return
      const id = e.pointerId
      active = false
      pointerId = null
      el.style.cursor = "grab"
      try {
        el.releasePointerCapture(id)
      } catch {
        /* ignore */
      }
    }

    el.style.cursor = "grab"
    el.style.touchAction = "pan-x"

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", end)
    el.addEventListener("pointercancel", end)

    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", end)
      el.removeEventListener("pointercancel", end)
      el.style.cursor = ""
      el.style.touchAction = ""
    }
  }, [ref])
}
