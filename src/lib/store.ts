import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Priority = "must-have" | "want" | "if-time"
export type Status = "hunting" | "found" | "bought" | "sold-out" | "skipped"
export type Category = "fashion" | "food" | "merch" | "beauty" | "home" | "misc"

export interface Store {
  id: string
  name: string
  area: string
  address?: string
  notes?: string
}

export interface Item {
  id: string
  name: string
  forWho: string
  priority: Priority
  category: Category
  quantity: number
  quantityBought: number
  currentStoreId: string | null
  backupStoreIds: string[]
  status: Status
  notes?: string
  price?: string
  createdAt: string
  updatedAt: string
}

interface AppState {
  items: Item[]
  stores: Store[]
  activeTab: string
  
  // Item actions
  addItem: (item: Omit<Item, "id" | "createdAt" | "updatedAt">) => void
  updateItem: (id: string, updates: Partial<Item>) => void
  deleteItem: (id: string) => void
  markBought: (id: string, quantity?: number) => void
  markSoldOut: (id: string) => void
  markSkipped: (id: string) => void
  resetStatus: (id: string) => void
  
  // Store actions
  addStore: (store: Omit<Store, "id">) => void
  updateStore: (id: string, updates: Partial<Store>) => void
  deleteStore: (id: string) => void
  
  // Navigation
  setActiveTab: (tab: string) => void
  
  // Backup
  exportData: () => string
  importData: (data: string) => boolean
}

const defaultStores: Store[] = [
  { id: "1", name: "Don Quijote Shibuya", area: "Shibuya", notes: "Open 24hrs" },
  { id: "2", name: "Tokyu Hands Shibuya", area: "Shibuya", notes: "Great for stationery" },
  { id: "3", name: "Onitsuka Tiger Harajuku", area: "Harajuku", notes: "Main flagship store" },
  { id: "4", name: "Kiddy Land Harajuku", area: "Harajuku", notes: "Character goods" },
  { id: "5", name: "Tokyo Banana Station", area: "Tokyo Station", notes: "Inside station" },
  { id: "6", name: "Animate Ikebukuro", area: "Ikebukuro", notes: "Largest anime store" },
  { id: "7", name: "Yodobashi Camera Akiba", area: "Akihabara", notes: "Electronics + more" },
  { id: "8", name: "LOFT Shibuya", area: "Shibuya", notes: "Lifestyle goods" },
  { id: "9", name: "Muji Ginza", area: "Ginza", notes: "Flagship - biggest selection" },
  { id: "10", name: "Daiso Harajuku", area: "Harajuku", notes: "100 yen shop" },
]

const defaultItems: Item[] = [
  {
    id: "1",
    name: "Nyota Blind Box",
    forWho: "Me",
    priority: "must-have",
    category: "merch",
    quantity: 3,
    quantityBought: 0,
    currentStoreId: "4",
    backupStoreIds: ["6"],
    status: "hunting",
    notes: "The cat series! Check for limited edition",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Onitsuka Tiger Mexico 66",
    forWho: "Me",
    priority: "must-have",
    category: "fashion",
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "3",
    backupStoreIds: [],
    status: "hunting",
    notes: "Size 24.5cm - cream/red colorway",
    price: "~15,000 yen",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Spicy Furikake",
    forWho: "Mom",
    priority: "want",
    category: "food",
    quantity: 5,
    quantityBought: 2,
    currentStoreId: "1",
    backupStoreIds: ["9"],
    status: "hunting",
    notes: "The one with shrimp bits",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Hojicha Powder",
    forWho: "Gift",
    priority: "want",
    category: "food",
    quantity: 2,
    quantityBought: 0,
    currentStoreId: "9",
    backupStoreIds: ["1"],
    status: "hunting",
    notes: "Premium grade for lattes",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Zojirushi Thermos",
    forWho: "Dad",
    priority: "must-have",
    category: "home",
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "7",
    backupStoreIds: ["1"],
    status: "hunting",
    notes: "500ml size, matte black",
    price: "~4,000 yen",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Cute Stickers",
    forWho: "Me",
    priority: "if-time",
    category: "misc",
    quantity: 10,
    quantityBought: 4,
    currentStoreId: "2",
    backupStoreIds: ["8", "10"],
    status: "hunting",
    notes: "Aesthetic journal stickers",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Tokyo Banana",
    forWho: "Office",
    priority: "must-have",
    category: "food",
    quantity: 2,
    quantityBought: 0,
    currentStoreId: "5",
    backupStoreIds: [],
    status: "hunting",
    notes: "Get before leaving! 2 boxes for colleagues",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Blue Lock Merch",
    forWho: "Brother",
    priority: "want",
    category: "merch",
    quantity: 1,
    quantityBought: 0,
    currentStoreId: "6",
    backupStoreIds: ["7"],
    status: "hunting",
    notes: "Isagi keychain or acrylic stand",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      items: defaultItems,
      stores: defaultStores,
      activeTab: "today",

      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      markBought: (id, quantity = 1) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item
            const newQuantityBought = Math.min(
              item.quantityBought + quantity,
              item.quantity
            )
            return {
              ...item,
              quantityBought: newQuantityBought,
              status: newQuantityBought >= item.quantity ? "bought" : "hunting",
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      markSoldOut: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: "sold-out" as Status, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      markSkipped: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: "skipped" as Status, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      resetStatus: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, status: "hunting" as Status, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      addStore: (store) =>
        set((state) => ({
          stores: [...state.stores, { ...store, id: Date.now().toString() }],
        })),

      updateStore: (id, updates) =>
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === id ? { ...store, ...updates } : store
          ),
        })),

      deleteStore: (id) =>
        set((state) => ({
          stores: state.stores.filter((store) => store.id !== id),
        })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      exportData: () => {
        const { items, stores } = get()
        return JSON.stringify({ items, stores, exportedAt: new Date().toISOString() })
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.items && parsed.stores) {
            set({ items: parsed.items, stores: parsed.stores })
            return true
          }
          return false
        } catch {
          return false
        }
      },
    }),
    {
      name: "yv-japan-buy-quest",
    }
  )
)

// Helper functions
export function getStoreById(stores: Store[], id: string | null): Store | undefined {
  if (!id) return undefined
  return stores.find((s) => s.id === id)
}

export function getItemsByStore(items: Item[], storeId: string): Item[] {
  return items.filter(
    (item) =>
      item.currentStoreId === storeId ||
      item.backupStoreIds.includes(storeId)
  )
}

export function getItemsByStatus(items: Item[], status: Status): Item[] {
  return items.filter((item) => item.status === status)
}

export function getItemsByCategory(items: Item[], category: Category): Item[] {
  return items.filter((item) => item.category === category)
}

export function getProgressPercentage(item: Item): number {
  if (item.quantity === 0) return 0
  return Math.round((item.quantityBought / item.quantity) * 100)
}

export const categoryColors: Record<Category, string> = {
  fashion: "bg-pastel-pink text-foreground",
  food: "bg-pastel-orange text-foreground",
  merch: "bg-pastel-blue text-foreground",
  beauty: "bg-pastel-purple text-foreground",
  home: "bg-pastel-green text-foreground",
  misc: "bg-pastel-yellow text-foreground",
}

export const priorityConfig: Record<Priority, { label: string; color: string }> = {
  "must-have": { label: "Must Have", color: "bg-primary text-primary-foreground" },
  want: { label: "Want", color: "bg-secondary text-secondary-foreground" },
  "if-time": { label: "If Time", color: "bg-muted text-muted-foreground" },
}

export const statusConfig: Record<Status, { label: string; icon: string }> = {
  hunting: { label: "Hunting", icon: "search" },
  found: { label: "Found", icon: "check" },
  bought: { label: "Bought", icon: "shopping-bag" },
  "sold-out": { label: "Sold Out", icon: "x" },
  skipped: { label: "Later", icon: "clock" },
}

