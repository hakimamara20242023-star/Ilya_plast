"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-[360px] rounded-xl border border-border bg-bg p-6">
        <div className="mb-6 text-center">
          <div className="text-[18px] font-extrabold text-brand">ILYA PLAST</div>
          <div className="mt-1 text-[13px] text-muted">لوحة التحكم</div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[13px] font-bold text-text">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-[13px] font-bold text-text">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-[16px] text-text"
              dir="ltr"
            />
          </div>

          {state.error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-[13px] font-bold text-red-700">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 min-h-12 rounded-lg bg-brand text-[16px] font-extrabold text-white disabled:opacity-60"
          >
            {pending ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
