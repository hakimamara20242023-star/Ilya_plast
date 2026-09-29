/** Shown instantly on navigation into a category, so tapping a category
 * card never looks frozen. Mirrors the real layout (header → sticky filter
 * bar → 2-col grid) so nothing jumps when the real content swaps in. */
export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-[640px] animate-pulse md:max-w-[1100px]">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <div className="h-9 w-9 flex-none rounded-lg bg-surface" />
        <div className="h-4 w-40 rounded bg-surface" />
      </div>

      <div className="flex gap-2 border-b border-border px-4 py-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-11 flex-1 rounded-lg bg-surface" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-bg"
          >
            <div className="aspect-square border-b border-border bg-surface" />
            <div className="px-3 pb-0.5 pt-2.5">
              <div className="h-5 w-12 rounded bg-surface" />
              <div className="mt-2 h-3 w-24 rounded bg-surface" />
            </div>
            <div className="px-3 pb-3 pt-2">
              <div className="h-11 rounded-[10px] bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
