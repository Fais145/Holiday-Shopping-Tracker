"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { StoreShoppingList } from "@/components/store-shopping-list"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

export default function StoreDetailView() {
  const params = useParams()
  const raw = params?.storeId
  const id = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : ""

  const stores = useAppStore((s) => s.stores)
  const store = id ? stores.find((s) => s.id === id) : undefined

  if (!id || !store) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center gap-4 px-4 pb-28"
      >
        <p className="text-muted-foreground text-sm">
          This shop isn&apos;t on your route. It may have been removed or the link is wrong.
        </p>
        <Button asChild variant="default" className="rounded-xl min-h-11">
          <Link href="/stores" prefetch>
            Back to all stores
          </Link>
        </Button>
      </motion.div>
    )
  }

  return <StoreShoppingList storeId={id} />
}
