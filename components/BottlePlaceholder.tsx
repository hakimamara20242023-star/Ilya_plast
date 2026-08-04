interface BottlePlaceholderProps {
  tone?: string;
  className?: string;
}

/** Stand-in bottle silhouette shown until a real photo is uploaded for a SKU. */
export default function BottlePlaceholder({
  tone = "#E3E8ED",
  className,
}: BottlePlaceholderProps) {
  return (
    <svg
      viewBox="0 0 100 140"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <rect x="40" y="4" width="20" height="14" rx="3" fill={tone} stroke="#5A6673" strokeWidth="1.5" />
      <path
        d="M40 18 L40 34 L28 52 C24 58 22 66 22 74 L22 126 C22 132 27 136 33 136 L67 136 C73 136 78 132 78 126 L78 74 C78 66 76 58 72 52 L60 34 L60 18 Z"
        fill={tone}
        stroke="#5A6673"
        strokeWidth="1.5"
      />
      <rect x="30" y="80" width="40" height="26" rx="2" fill="#ffffff" opacity="0.55" />
    </svg>
  );
}
