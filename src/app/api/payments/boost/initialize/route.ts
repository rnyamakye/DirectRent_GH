import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Server-side source of truth for pricing — never trust an amount
// sent from the browser, since anyone could edit that value in
// DevTools before it reaches you. The client only ever sends WHICH
// duration was picked; the price itself is looked up here.
const AGENT_PRICING: Record<number, number> = { 7: 20, 14: 35, 30: 60 };
const ARTISAN_PRICING: Record<number, number> = { 7: 15, 14: 25, 30: 45 };

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const { targetType, targetId, days } = await request.json();

    if (!["listing", "artisan"].includes(targetType) || !targetId || !days) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const pricing = targetType === "listing" ? AGENT_PRICING : ARTISAN_PRICING;
    const amountGhs = pricing[days];

    if (!amountGhs) {
        return NextResponse.json({ error: "Invalid duration." }, { status: 400 });
    }

    if (targetType === "listing") {
        const { data: listing } = await supabase
            .from("listings")
            .select("agent_id")
            .eq("id", targetId)
            .single();
        if (listing?.agent_id !== user.id) {
            return NextResponse.json({ error: "You don't own this listing." }, { status: 403 });
        }
    } else {
        if (targetId !== user.id) {
            return NextResponse.json({ error: "You can only boost your own profile." }, { status: 403 });
        }
    }

    const reference = `boost_${crypto.randomUUID()}`;
    const amountPesewas = amountGhs * 100;

    const { error: insertError } = await supabase.from("boost_payments").insert({
        owner_id: user.id,
        target_type: targetType,
        target_id: targetId,
        days,
        amount_pesewas: amountPesewas,
        reference,
    });

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { origin } = new URL(request.url);

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: user.email,
            amount: amountPesewas,
            currency: "GHS",
            reference,
            callback_url: `${origin}/api/payments/boost/callback`,
        }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
        return NextResponse.json({ error: "Could not start payment." }, { status: 500 });
    }

    return NextResponse.json({ authorizationUrl: paystackData.data.authorization_url });
}