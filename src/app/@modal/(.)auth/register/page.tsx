import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { Modal } from "@/components/ui/modal";

export default function RegisterModal() {
  return (
    <Modal>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </Modal>
  );
}
