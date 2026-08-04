"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-[500px] rounded-lg bg-accent px-4 py-3 text-center text-[14px] font-bold text-white shadow-lg">
      {message}
    </div>
  );
}
