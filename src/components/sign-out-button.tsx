"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export function SignOutButton({ className, children }: { className?: string, children?: React.ReactNode }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    async function handleSignOut() {
        setIsSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();

        // Clear our marker cookie too, so it doesn't linger for whoever
        // uses this browser next.
        document.cookie = "dr_remember=; path=/; max-age=0";

        setIsSigningOut(false);
        setIsModalOpen(false);
        
        router.push("/");
        router.refresh(); // see explanation below
    }

    return (
        <>
            <button 
                onClick={() => setIsModalOpen(true)} 
                className={className || "text-sm font-supporting text-body hover:text-heading"}
            >
                {children || "Sign out"}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Sign out"
                message="Are you sure you want to sign out of your account?"
                confirmText="Sign out"
                cancelText="Cancel"
                isDestructive={true}
                isLoading={isSigningOut}
                onConfirm={handleSignOut}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
