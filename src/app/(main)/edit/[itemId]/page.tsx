"use client"

import { useParams } from "next/navigation"
import { EditItemView } from "@/components/views/add-item-view"

export default function EditQuestItemPage() {
  const params = useParams()
  const raw = params?.itemId
  const itemId = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : ""

  return <EditItemView itemId={itemId} />
}
