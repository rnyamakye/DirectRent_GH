import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const { amountGhs, paymentMethodId, notes } = await request.json();

    if (!amountGhs || !paymentMethodId) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const amountPesewas = amountGhs * 100;

    // Check if user has sufficient balance
    const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("id, balance_pesewas")
        .eq("user_id", user.id)
        .single();

    if (walletError || !wallet) {
        return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
    }

    if (wallet.balance_pesewas < amountPesewas) {
        return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });
    }

    // Since we don't have stored procedures to handle transactions out of the box easily,
    // we do this in steps (in production, use a postgres function or pg_trgm/pg_bouncer transaction)
    
    // 1. Create the payout request
    const { data: payoutRequest, error: payoutError } = await supabase
        .from("payout_requests")
        .insert({
            user_id: user.id,
            amount_pesewas: amountPesewas,
            payment_method_id: paymentMethodId,
            notes,
        })
        .select("id")
        .single();

    if (payoutError) {
        return NextResponse.json({ error: payoutError.message }, { status: 500 });
    }

    // 2. Debit the wallet (negative balance_pesewas update in a real txn, here we do a direct update)
    // To prevent race conditions, a stored procedure would be better.
    const newBalance = wallet.balance_pesewas - amountPesewas;
    const { error: updateError } = await supabase
        .from("wallets")
        .update({ balance_pesewas: newBalance })
        .eq("id", wallet.id);

    if (updateError) {
        // Warning: This could cause inconsistency if the update fails after creating the payout request.
        return NextResponse.json({ error: "Failed to update wallet balance." }, { status: 500 });
    }

    // 3. Create wallet transaction
    await supabase.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        type: "debit",
        amount_pesewas: amountPesewas,
        reference: `payout_${payoutRequest.id}`,
        description: "Withdrawal request",
    });

    return NextResponse.json({ success: true, newBalance });
}
