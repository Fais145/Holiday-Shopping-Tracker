/** Store-specific shopping list (App Router). */
export function storePagePath(storeId: string): string {
  return `/stores/${encodeURIComponent(storeId)}`
}

/** Edit an existing quest item. */
export function editItemPagePath(itemId: string): string {
  return `/edit/${encodeURIComponent(itemId)}`
}
