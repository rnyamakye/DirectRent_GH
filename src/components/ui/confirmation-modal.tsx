"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "@/components/ui/spinner";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
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
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !mounted) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isLoading) {
      onClose();
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-sm bg-canvas rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-heading mb-3">{title}</h3>
        <div className="text-body text-sm mb-8 leading-relaxed">{message}</div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm border border-border bg-card text-heading hover:bg-slate-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 ${
              isDestructive 
                ? "bg-red-600 hover:bg-red-700 hover:shadow-red-500/20" 
                : "bg-primary hover:bg-primary-hover hover:shadow-primary/20"
            }`}
          >
            {isLoading && <Spinner className="w-4 h-4" />}
            {isLoading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
