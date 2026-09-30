"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { resizeProductImage } from "@/lib/admin/resize-image";
import { imageUrl, toThumbPath } from "@/lib/storage";

interface ImageUploaderProps {
  sku: string;
  images: string[];
  onChange: (images: string[]) => void;
}

interface UploadingFile {
  key: string;
  name: string;
  step: "compressing" | "uploading" | "error";
}

function pathsForIndex(sku: string, index: number) {
  const label = index === 0 ? "" : `${index + 1}-`;
  return {
    full: `${sku}/${label}full.webp`,
    thumb: `${sku}/${label}thumb.webp`,
  };
}

export default function ImageUploader({ sku, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const skuReady = sku.trim().length > 0;

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    for (const file of list) {
      const key = `${Date.now()}-${file.name}`;
      setUploading((u) => [...u, { key, name: file.name, step: "compressing" }]);

      try {
        const { full, thumb } = await resizeProductImage(file);
        setUploading((u) => u.map((f) => (f.key === key ? { ...f, step: "uploading" } : f)));

        const index = images.length;
        const paths = pathsForIndex(sku, index);
        const supabase = getSupabaseBrowserClient();

        const [fullRes, thumbRes] = await Promise.all([
          supabase.storage
            .from("products")
            .upload(paths.full, full, { contentType: "image/webp", upsert: true }),
          supabase.storage
            .from("products")
            .upload(paths.thumb, thumb, { contentType: "image/webp", upsert: true }),
        ]);

        if (fullRes.error || thumbRes.error) {
          throw fullRes.error ?? thumbRes.error;
        }

        onChange([...images, paths.full]);
        setUploading((u) => u.filter((f) => f.key !== key));
      } catch {
        setUploading((u) => u.map((f) => (f.key === key ? { ...f, step: "error" } : f)));
      }
    }
  }

  async function removeImage(path: string) {
    onChange(images.filter((p) => p !== path));
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.storage.from("products").remove([path, toThumbPath(path)]);
    } catch {
      // Best-effort cleanup — the form array is already updated either way.
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = images.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (!skuReady) return;
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function handleDragStart(index: number) {
    return (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", String(index));
    };
  }

  function handleDropOnThumb(index: number) {
    return (e: React.DragEvent) => {
      e.preventDefault();
      const from = Number(e.dataTransfer.getData("text/plain"));
      if (Number.isNaN(from) || from === index) return;
      const next = images.slice();
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      onChange(next);
    };
  }

  if (!skuReady) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-[13px] text-muted">
        أكمل الحقول الأساسية أولاً (الفئة، السدادة، الحجم، الوزن) لإضافة الصور
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center ${
          dragOver ? "border-brand bg-brand/5" : "border-border bg-surface"
        }`}
      >
        <span className="text-[28px]">📷</span>
        <span className="text-[14px] font-bold text-text">إضافة صورة</span>
        <span className="text-[12px] text-muted">اسحب الصور هنا أو اضغط للتصوير/الاختيار</span>
      </button>

      {uploading.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {uploading.map((f) => (
            <div key={f.key} className="rounded-lg border border-border bg-bg p-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="truncate text-text">{f.name}</span>
                <span className={f.step === "error" ? "text-red-600" : "text-muted"}>
                  {f.step === "compressing" && "جارٍ الضغط..."}
                  {f.step === "uploading" && "جارٍ الرفع..."}
                  {f.step === "error" && "فشل الرفع"}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full transition-all ${
                    f.step === "error" ? "bg-red-500" : "bg-accent"
                  }`}
                  style={{ width: f.step === "compressing" ? "40%" : f.step === "error" ? "100%" : "80%" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {images.map((path, index) => (
            <div
              key={path}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropOnThumb(index)}
              className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-bg"
            >
              <Image
                src={imageUrl(toThumbPath(path))}
                alt=""
                fill
                sizes="150px"
                style={{ objectFit: "cover" }}
              />
              {index === 0 && (
                <span className="absolute right-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white">
                  الصورة الرئيسية
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(path)}
                aria-label="حذف الصورة"
                className="absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-[14px] text-white"
              >
                ✕
              </button>
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45">
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label="نقل للخلف"
                  className="flex h-11 flex-1 items-center justify-center text-[16px] text-white disabled:opacity-30"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="نقل للأمام"
                  className="flex h-11 flex-1 items-center justify-center text-[16px] text-white disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
