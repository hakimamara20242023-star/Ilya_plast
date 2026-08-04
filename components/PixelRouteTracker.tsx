"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { fbqTrack } from "@/lib/pixel";
import { captureUtm } from "@/lib/utm";

/**
 * The App Router doesn't fire a PageView on client-side navigation, so we
 * track path changes manually. The pixel's own init script already fires
 * the first PageView, so we skip firing again on mount here.
 */
export default function PixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const search = searchParams.toString();
    captureUtm(search ? `?${search}` : "");

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fbqTrack("PageView");
  }, [pathname, searchParams]);

  return null;
}
