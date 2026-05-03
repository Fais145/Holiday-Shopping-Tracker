/** Shown briefly while the root `page` segment loads (e.g. `/` redirect). */
export default function RootLoading() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-3 bg-background px-4">
      <div
        className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}
