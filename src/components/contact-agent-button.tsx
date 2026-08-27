"use client";

import { useState } from "react";
import { AuthGuardLink } from "@/components/auth-guard-link";

export function ContactAgentButton({
    agentId,
    phone,
    email
}: {
    agentId: string;
    phone: string | null;
    email?: string | null;
}) {
    const [isOpen, setIsOpen] = useState(false);

    // Format phone for WhatsApp by removing non-numeric characters
    const waPhone = phone ? phone.replace(/[^0-9]/g, '') : '';

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center bg-primary text-white rounded-lg py-3 font-bold hover:bg-primary-hover transition mt-6"
            >
                Contact Agent
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-card w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-border flex justify-between items-center bg-canvas/30">
                            <h3 className="font-bold text-heading text-lg">Contact Options</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-border/50 text-body hover:bg-border transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 flex flex-col gap-3">
                            {phone ? (
                                <>
                                    <a
                                        href={`tel:${phone}`}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl group-hover:scale-110 transition-transform">
                                            📞
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-heading">Phone Call</p>
                                            <p className="text-sm text-body">{phone}</p>
                                        </div>
                                    </a>
                                    <a
                                        href={`https://wa.me/${waPhone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-[#25D366]/50 hover:bg-[#25D366]/5 transition group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] text-xl group-hover:scale-110 transition-transform">
                                            💬
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-heading">WhatsApp</p>
                                            <p className="text-sm text-body">Chat instantly</p>
                                        </div>
                                    </a>
                                    <a
                                        href={`sms:${phone}`}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl group-hover:scale-110 transition-transform">
                                            ✉️
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-heading">Text Message</p>
                                            <p className="text-sm text-body">Send an SMS</p>
                                        </div>
                                    </a>
                                </>
                            ) : (
                                <div className="p-4 text-center text-body/70">
                                    No direct phone number available.
                                </div>
                            )}

                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-blue-400/50 hover:bg-blue-400/5 transition group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400 text-xl group-hover:scale-110 transition-transform">
                                        📧
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-heading">Email Agent</p>
                                        <p className="text-sm text-body">{email}</p>
                                    </div>
                                </a>
                            )}

                            <AuthGuardLink
                                href={`/messages?with=${agentId}`}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition group"
                            >
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl group-hover:scale-110 transition-transform">
                                    🔔
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-heading">In-App Message</p>
                                    <p className="text-sm text-body">Requires login</p>
                                </div>
                            </AuthGuardLink>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
