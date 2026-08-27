import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LISTING_PRICE_GHS = 20;

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const { listingId } = await request.json();

    if (!listingId) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { data: listing } = await supabase
        .from("listings")
        .select("agent_id, status")
        .eq("id", listingId)
        .single();

    if (listing?.agent_id !== user.id) {
        return NextResponse.json({ error: "You don't own this listing." }, { status: 403 });
    }

    if (listing.status !== "pending_payment") {
        return NextResponse.json({ error: "This listing does not require payment." }, { status: 400 });
    }

    const reference = `listing_${crypto.randomUUID()}`;
    const amountPesewas = LISTING_PRICE_GHS * 100;

    const { error: insertError } = await supabase.from("listing_payments").insert({
        agent_id: user.id,
        listing_id: listingId,
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
            callback_url: `${origin}/api/payments/listing/callback`,
        }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
        return NextResponse.json({ error: "Could not start payment." }, { status: 500 });
    }

    return NextResponse.json({ authorizationUrl: paystackData.data.authorization_url });
}
