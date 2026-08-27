import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const amountPesewas = amountGhs * 100;

    // Check if user has sufficient wallet balance
    const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("id, balance_pesewas")
        .eq("user_id", user.id)
        .single();

    if (walletError || !wallet || wallet.balance_pesewas < amountPesewas) {
        return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 400 });
    }

    // Deduct from wallet
    const newBalance = wallet.balance_pesewas - amountPesewas;
    const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance_pesewas: newBalance })
        .eq("id", wallet.id);

    if (updateError) {
        return NextResponse.json({ error: "Failed to update wallet balance." }, { status: 500 });
    }

    const reference = `boost_wallet_${crypto.randomUUID()}`;

    // Create a successful boost payment record
    await supabase.from("boost_payments").insert({
        owner_id: user.id,
        target_type: targetType,
        target_id: targetId,
        days,
        amount_pesewas: amountPesewas,
        reference,
        status: "success",
    });

    // Create wallet transaction
    await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        type: "debit",
        amount_pesewas: amountPesewas,
        reference,
        description: `Paid for ${days}-day ${targetType} boost`,
    });

    // Apply the boost
    const boostedUntil = new Date();
    boostedUntil.setDate(boostedUntil.getDate() + days);

    const table = targetType === "listing" ? "listings" : "artisan_profiles";
    await supabase
        .from(table)
        .update({ boosted_until: boostedUntil.toISOString() })
        .eq("id", targetId);

    const successUrl = targetType === "listing" ? "/agent/boost/success" : "/artisan/boost/success";
    const params = new URLSearchParams({ days: String(days) });
    if (targetType === "listing") params.set("listingId", targetId);

    return NextResponse.json({ redirectUrl: `${successUrl}?${params.toString()}` });
}
