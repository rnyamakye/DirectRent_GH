import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Modal } from "@/components/ui/modal";

export default function LoginModal() {
  return (
    <Modal>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </Modal>
  );
}
