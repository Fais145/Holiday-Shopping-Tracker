"use client"

import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { ItemCard } from "@/components/item-card"
import {
  appearsActiveForStoreRow,
  compareItemsForStoreShelf,
  getItemsByStore,
  useAppStore,
} from "@/lib/store"

interface StoreShoppingListProps {
  storeId: string
}

export function StoreShoppingList({ storeId }: StoreShoppingListProps) {
  const { items, stores } = useAppStore()

  const storeItems = getItemsByStore(items, storeId).filter((i) =>
    appearsActiveForStoreRow(i, storeId)
  )

  const sorted = [...storeItems].sort((a, b) => compareItemsForStoreShelf(a, b, storeId))

  if (sorted.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-muted-foreground text-center py-12 px-4"
      >
        Nothing on your quest list here right now. Check another location or add an item!
      </motion.p>
    )
  }

  return (
    <div className="flex flex-col gap-3 pb-28">
      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <span>{sorted.length === 1 ? "1 thing" : `${sorted.length} things`} to look for:</span>
      </p>
      {sorted.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          stores={stores}
          shoppingStoreId={storeId}
          showActions
          showBackupStores
          linkStoreNames
        />
      ))}
    </div>
  )
}
