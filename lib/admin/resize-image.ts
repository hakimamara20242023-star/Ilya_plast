"use client";

function resizeToWebp(source: ImageBitmap, maxWidth: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxWidth / source.width);
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر إنشاء لوحة الرسم لضغط الصورة");
  ctx.drawImage(source, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("تعذر ضغط الصورة"))),
      "image/webp",
      quality
    );
  });
}

export interface ResizedImagePair {
  full: Blob;
  thumb: Blob;
}

/** full: max width 1200px, WebP q0.82. thumb: max width 400px, WebP q0.80.
 * Done in-browser so we never upload multi-MB phone photos — Supabase's
 * own image transformation is a paid feature we're not relying on. */
export async function resizeProductImage(file: File): Promise<ResizedImagePair> {
  const bitmap = await createImageBitmap(file);
  try {
    const [full, thumb] = await Promise.all([
      resizeToWebp(bitmap, 1200, 0.82),
      resizeToWebp(bitmap, 400, 0.8),
    ]);
    return { full, thumb };
  } finally {
    bitmap.close();
  }
}
