"use client";

import type { ReactNode } from "react";
import { fbqTrack, genEventId, sendCapiEvent } from "@/lib/pixel";

interface ContactPhoneLinkProps {
  phone: string;
  className?: string;
  children: ReactNode;
}

export default function ContactPhoneLink({
  phone,
  className,
  children,
}: ContactPhoneLinkProps) {
  function handleClick() {
    const eventId = genEventId();
    fbqTrack("Contact", {}, eventId);
    sendCapiEvent({ event_name: "Contact", event_id: eventId });
  }

  return (
    <a href={`tel:${phone}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
