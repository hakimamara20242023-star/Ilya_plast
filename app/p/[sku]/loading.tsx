/** Instant skeleton for the product page. Mirrors the above-the-fold
 * layout (header → square gallery → thumbs → name/sku → quick specs) so
 * the swap to real content doesn't shift anything. */
export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[640px] animate-pulse pb-28 lg:max-w-[1100px] lg:pb-10">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
        <div className="h-9 w-9 flex-none rounded-lg bg-surface" />
        <div className="h-3.5 w-24 rounded bg-surface" />
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:px-4 lg:pt-6">
        <div>
          <div className="mx-4 mt-4 aspect-square rounded-xl border border-border bg-surface lg:mt-0" />
          <div className="mt-2 flex gap-2.5 px-4 pb-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-square flex-1 rounded-lg border border-border bg-surface"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="px-4">
            <div className="h-5 w-56 rounded bg-surface" />
            <div className="mt-2 h-3.5 w-32 rounded bg-surface" />
          </div>

          <div className="mx-4 mt-4 flex rounded-xl border border-border py-3.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex flex-1 flex-col items-center gap-2 ${
                  i < 2 ? "border-e border-border" : ""
                }`}
              >
                <div className="h-5 w-12 rounded bg-surface" />
                <div className="h-3 w-10 rounded bg-surface" />
              </div>
            ))}
          </div>

          <div className="mx-4 mt-5 h-32 rounded-xl bg-surface" />
          <div className="mx-4 mt-5 h-28 rounded-xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
