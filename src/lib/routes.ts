/** Store-specific shopping list (App Router). */
export function storePagePath(storeId: string): string {
  return `/stores/${encodeURIComponent(storeId)}`
}
