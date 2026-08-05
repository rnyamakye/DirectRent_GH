import { createBrowserClient } from "@supabase/ssr";

export function createClient(options?: { persistSession?: boolean }) {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        options?.persistSession === false
            ? { auth: { storage: sessionStorage } }
            : undefined
    );
}