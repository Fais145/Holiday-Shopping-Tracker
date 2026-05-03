"use client"

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Store, getStoreById } from "@/lib/store"
import { cn } from "@/lib/utils"

function SortableRow({
  sid,
  index,
  total,
  label,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  sid: string
  index: number
  total: number
  label: string
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sid })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-0.5 rounded-xl border border-border bg-card py-1.5 pl-0.5 pr-1 min-h-12 shadow-sm",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/30"
      )}
    >
      <button
        type="button"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg touch-manipulation cursor-grab active:cursor-grabbing text-muted-foreground hover:bg-muted/80 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Drag to reorder: ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" aria-hidden />
      </button>
      <span className="tabular-nums text-xs font-semibold text-primary w-6 shrink-0 text-center">
        {index + 1}
      </span>
      <span className="flex-1 min-w-0 text-sm font-medium truncate">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10 shrink-0 rounded-lg touch-manipulation"
        aria-label={`Move ${label} higher in hunt order`}
        disabled={index === 0}
        onClick={onMoveUp}
      >
        <ChevronUp className="size-5" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10 shrink-0 rounded-lg touch-manipulation"
        aria-label={`Move ${label} lower in hunt order`}
        disabled={index === total - 1}
        onClick={onMoveDown}
      >
        <ChevronDown className="size-5" aria-hidden />
      </Button>
      <button
        type="button"
        aria-label={`Remove ${label} from hunt list`}
        className="inline-flex shrink-0 size-10 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onRemove}
      >
        <X className="size-4" aria-hidden />
      </button>
    </li>
  )
}

export function ShopPrioritySortableList({
  storeIds,
  stores,
  onReorder,
  onRemove,
}: {
  storeIds: string[]
  stores: Store[]
  onReorder: (next: string[]) => void
  onRemove: (storeId: string) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = storeIds.indexOf(String(active.id))
    const newIndex = storeIds.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(storeIds, oldIndex, newIndex))
  }

  const moveByDelta = (sid: string, delta: number) => {
    const i = storeIds.indexOf(sid)
    if (i < 0) return
    const j = i + delta
    if (j < 0 || j >= storeIds.length) return
    onReorder(arrayMove(storeIds, i, j))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={storeIds} strategy={verticalListSortingStrategy}>
        <ul
          className="flex flex-col gap-2"
          aria-label="Shop hunt order, drag the grip to reorder"
        >
          {storeIds.map((sid, index) => {
            const shop = getStoreById(stores, sid)
            const place = shop?.area ? ` · ${shop.area}` : ""
            const label = `${shop?.name ?? "Shop"}${place}`
            return (
              <SortableRow
                key={sid}
                sid={sid}
                index={index}
                total={storeIds.length}
                label={label}
                onMoveUp={() => moveByDelta(sid, -1)}
                onMoveDown={() => moveByDelta(sid, 1)}
                onRemove={() => onRemove(sid)}
              />
            )
          })}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
