import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 mt-8 mb-16">
      <div className="w-full max-w-xl bg-canvas rounded-2xl shadow-xl border border-border p-6 md:p-8">
        <Suspense fallback={<div>Loading...</div>}><RegisterForm /></Suspense>
      </div>
    </div>
  );
}
