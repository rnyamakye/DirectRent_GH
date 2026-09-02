"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  name: string;
  phone: string | null;
  email: string | null;
  onMessage: () => void;
  role: "agent" | "renter";
}

export function ContactModal({
  isOpen,
  onClose,
  title,
  name,
  phone,
  email,
  onMessage,
  role,
}: ContactModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-sm bg-canvas rounded-3xl shadow-2xl p-6 text-left animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-heading">
              {title}
            </h3>
            <p className="text-sm text-body mt-1">How would you like to contact {name}?</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-body/50 hover:bg-slate-100 rounded-full transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 transition group"
            >
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Phone Call</p>
                <p className="text-sm text-gray-400 mt-0.5">{phone}</p>
              </div>
            </a>
          ) : email ? (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-4 p-4 rounded-2xl transition group"
            >
              <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Email {role === "agent" ? "Agent" : "Renter"}</p>
                <p className="text-sm text-gray-400 mt-0.5">{email}</p>
              </div>
            </a>
          ) : null}

          <button
            onClick={() => {
              onClose();
              onMessage();
            }}
            className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 transition group text-left w-full"
          >
            <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-bold ">In-App Message</p>
              <p className="text-sm text-gray-400 mt-0.5">Chat securely on DirectRent</p>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
