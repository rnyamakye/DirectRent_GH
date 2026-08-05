"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";

export function AuthGuardLink({ 
  href, 
  children, 
  className 
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string; 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Check if the user is holding cmd/ctrl/shift to open in a new tab
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
      return;
    }

    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setLoading(false);
    
    if (user) {
      router.push(href);
    } else {
      router.push(`/auth/login?returnTo=${encodeURIComponent(href)}`);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
