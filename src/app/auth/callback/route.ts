import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
    }

    const supabase = await createClient();

    // This is the actual handshake: Google redirected the browser here
    // with a temporary `code` in the URL. Exchanging it is what turns
    // that code into a real, cookie-backed Supabase session — the same
    // kind of session email/password login creates via signInWithPassword.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
        return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    const nextUrl = searchParams.get("next");

    if (!profile?.role) {
        return NextResponse.redirect(`${origin}/auth/select-role`);
    }

    if (nextUrl) {
        return NextResponse.redirect(`${origin}${nextUrl}`);
    }

    return NextResponse.redirect(`${origin}/${profile.role}/dashboard`);
}