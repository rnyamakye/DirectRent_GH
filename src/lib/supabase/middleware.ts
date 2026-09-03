import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // This call refreshes the auth token if it's expired, and tells us
    // whether the visitor is currently signed in. Don't remove it —
    // without it, users get silently logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser();
    // If someone's already logged in, don't let them see the login or
    // register forms again — send them straight to their dashboard.
    const isAuthPage =
        request.nextUrl.pathname === "/auth/login" ||
        request.nextUrl.pathname === "/auth/register";

    if (isAuthPage && user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // No role yet (an OAuth sign-up that hasn't picked one) — send them
        // to pick one instead of guessing a dashboard that doesn't apply.
        if (!profile?.role) {
            return NextResponse.redirect(new URL("/auth/select-role", request.url));
        }

        const dashboardUrl = new URL(`/${profile.role}/dashboard`, request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // If a logged-in user with no role lands on the homepage, redirect them
    // to select-role immediately — prevents the marketing page flashing.
    const isHomepage = request.nextUrl.pathname === "/";
    if (isHomepage && user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile?.role) {
            return NextResponse.redirect(new URL("/auth/select-role", request.url));
        }
    }

    // Route protection, per the Page Layout & Routing Guide: everything
    // under /renter/, /agent/, /artisan/ requires a signed-in user.


    // Matching "/artisan" against pathname.startsWith() would also match
    // "/artisans" (the public feed) — same prefix, different route
    // entirely. Require either an exact match or a following "/", so
    // "/artisan/dashboard" matches but "/artisans" doesn't.
    function matchesPrefix(pathname: string, prefix: string) {
        return pathname === prefix || pathname.startsWith(prefix + "/");
    }

    const protectedPrefixes = ["/agent", "/artisan", "/renter"];
    const isProtectedRoute =
        protectedPrefixes.some((prefix) => matchesPrefix(request.nextUrl.pathname, prefix));

    if (isProtectedRoute && !user) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set(
            "returnTo",
            request.nextUrl.pathname + request.nextUrl.search
        );
        return NextResponse.redirect(loginUrl);
    }

    // Being logged in isn't enough on its own — an agent has no
    // business browsing /renter/* pages, and vice versa. This is the
    // check that was missing: not just "is someone signed in" but
    // "does their actual role match the section they're trying to reach."
    if (isProtectedRoute && user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const roleForPrefix: Record<string, string> = {
            "/agent": "agent",
            "/artisan": "artisan",
            "/renter": "renter",
        };

        const matchedPrefix = protectedPrefixes.find((prefix) =>
            matchesPrefix(request.nextUrl.pathname, prefix)
        )!;

        if (profile?.role !== roleForPrefix[matchedPrefix]) {
            if (!profile?.role) {
                return NextResponse.redirect(new URL("/auth/select-role", request.url));
            }

            const correctDashboard = new URL(`/${profile.role}/dashboard`, request.url);
            return NextResponse.redirect(correctDashboard);
        }
    }

    return supabaseResponse;
}