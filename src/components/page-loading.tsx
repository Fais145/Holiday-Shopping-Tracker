import { cn } from "@/lib/utils"

type PageLoadingProps = {
  className?: string
}

/** Skeleton shown in `(main)` while a route segment loads (App Router `loading.tsx`). */
export function PageLoading({ className }: PageLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 pb-28 animate-in fade-in duration-200",
        className
      )}
      aria-busy
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-7 w-40 max-w-full rounded-lg bg-muted animate-pulse" />
        <div className="h-3.5 w-56 max-w-full rounded-md bg-muted/70 animate-pulse" />
      </div>

      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/50"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="size-10 shrink-0 rounded-xl bg-muted animate-pulse" />
              <div className="flex flex-1 flex-col gap-2 min-w-0">
                <div className="h-4 w-[72%] max-w-full rounded-md bg-muted animate-pulse" />
                <div className="h-3 w-[40%] max-w-full rounded bg-muted/70 animate-pulse" />
              </div>
              <div className="h-6 w-14 shrink-0 rounded-full bg-muted/60 animate-pulse" />
            </div>
            <div className="h-12 w-full rounded-xl bg-muted/50 animate-pulse" />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">Loading your quest…</p>
    </div>
  )
}
