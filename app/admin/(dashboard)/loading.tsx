/** Covers every dashboard route. These pages are force-dynamic (they hit
 * Supabase on every request, no ISR cache), so they're the ones most likely
 * to feel slow — a generic card skeleton beats a blank screen. */
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-5 w-32 rounded bg-border/60" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-border bg-bg" />
        ))}
      </div>
    </div>
  );
}
