"use client";

import type { ReactNode } from "react";
import {
  buildGeneralWhatsAppUrl,
  buildProductWhatsAppUrl,
} from "@/lib/whatsapp";
import { fbqTrack, genEventId, sendCapiEvent } from "@/lib/pixel";
import { getStoredUtm } from "@/lib/utm";
import { postBeacon } from "@/lib/beacon";
import type { Product, WhatsAppSource } from "@/lib/types";

interface WhatsAppButtonProps {
  product?: Product;
  categoryId?: string;
  source: WhatsAppSource;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export default function WhatsAppButton({
  product,
  categoryId,
  source,
  className,
  ariaLabel,
  children,
}: WhatsAppButtonProps) {
  const url = product ? buildProductWhatsAppUrl(product) : buildGeneralWhatsAppUrl();
  const contentCategory = product?.category_id ?? categoryId;

  function handleClick() {
    const eventId = genEventId();

    fbqTrack(
      "Lead",
      {
        content_ids: product ? [product.sku] : undefined,
        content_name: product?.name_ar,
        content_category: contentCategory,
        source,
      },
      eventId
    );

    sendCapiEvent({
      event_name: "Lead",
      event_id: eventId,
      sku: product?.sku,
      content_category: contentCategory,
      source,
    });

    postBeacon("/api/log-click", {
      sku: product?.sku,
      category_id: contentCategory,
      source,
      ...getStoredUtm(),
    });
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
