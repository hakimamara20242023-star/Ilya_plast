"use client";

import { useState } from "react";

interface TagInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export default function TagInput({
  values,
  onChange,
  suggestions = [],
  placeholder,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function add(value: string) {
    const trimmed = value.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
  }

  function remove(value: string) {
    onChange(values.filter((v) => v !== value));
  }

  function toggleSuggestion(value: string) {
    if (values.includes(value)) remove(value);
    else add(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      add(draft);
      setDraft("");
    }
  }

  const remainingSuggestions = suggestions.filter((s) => !values.includes(s));

  return (
    <div>
      {values.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-bg px-3 text-[14px] text-text"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                aria-label="حذف"
                className="text-[13px] text-muted"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-12 flex-1 rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
        />
        <button
          type="button"
          onClick={() => {
            add(draft);
            setDraft("");
          }}
          className="min-h-12 rounded-lg border border-border bg-surface px-4 text-[14px] font-bold text-brand"
        >
          + إضافة
        </button>
      </div>

      {remainingSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSuggestion(s)}
              className="min-h-9 rounded-full border border-border bg-bg px-3 text-[12px] text-muted"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
