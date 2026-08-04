"use server";

import { redirect } from "next/navigation";
import { getSupabaseAuthedServerClient } from "@/lib/supabase/server-auth";

export interface LoginState {
  error?: string;
}

export async function signIn(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "أدخل البريد الإلكتروني وكلمة المرور" };
  }

  const supabase = await getSupabaseAuthedServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await getSupabaseAuthedServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
