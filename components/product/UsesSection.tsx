import Link from "next/link";

interface UsesSectionProps {
  uses: string[];
  notSuitable: string[];
  useNote: string | null;
  categoryId: string;
}

/**
 * The buyer fills these bottles with their own liquid — "does it fit MY
 * product?" is a bigger buying signal than any spec row, so this sits right
 * after QuickSpecs. Part B (not suitable) must read as expert honesty, not
 * a legal disclaimer: no red, no warning-banner styling, quieter than Part A.
 */
export default function UsesSection({
  uses,
  notSuitable,
  useNote,
  categoryId,
}: UsesSectionProps) {
  if (uses.length === 0 && notSuitable.length === 0) return null;

  const mentionsHdpe = useNote?.toUpperCase().includes("HDPE") ?? false;

  return (
    <div className="mx-4 rounded-xl bg-surface p-4">
      {uses.length > 0 && (
        <>
          <div className="mb-2.5 text-[16px] font-bold text-text">✅ مناسبة لـ</div>
          <div className="flex flex-wrap gap-2">
            {uses.map((use) => (
              <div
                key={use}
                className="rounded-lg border border-border bg-bg px-3 py-2 text-[15px] text-text"
              >
                {use}
              </div>
            ))}
          </div>
        </>
      )}

      {notSuitable.length > 0 && (
        <div className={uses.length > 0 ? "mt-4 border-t border-border pt-4" : ""}>
          <div className="mb-1.5 text-[14px] font-bold text-muted">⚠️ غير مناسبة لـ</div>
          {notSuitable.map((item) => (
            <div key={item} className="text-[14px] leading-[1.7] text-muted">
              ✗ {item}
            </div>
          ))}
        </div>
      )}

      {useNote && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 rounded-lg bg-brand/8 p-3 text-[14px] text-brand">
          <span>ℹ️ {useNote}</span>
          {mentionsHdpe && (
            <Link href={`/c/${categoryId}?material=HDPE`} className="font-bold underline">
              شوف قوارير HDPE ←
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
