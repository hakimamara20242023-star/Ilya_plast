import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تسجيل الدخول — ILYA PLAST",
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
