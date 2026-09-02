import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-canvas rounded-2xl shadow-xl border border-border p-6 md:p-8">
        <Suspense fallback={<div>Loading...</div>}><LoginForm /></Suspense>
      </div>
    </div>
  );
}
