import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
        return NextResponse.redirect(`${origin}/renter/dashboard?error=Missing+reference`);
    }

    const supabase = await createClient();

    const { data: payment } = await supabase
        .from("booking_payments")
        .select("*, bookings(*)")
        .eq("reference", reference)
        .single();

    if (!payment) {
        return NextResponse.redirect(`${origin}/renter/dashboard?error=Unknown+payment`);
    }

    const booking = payment.bookings;

    if (payment.status === "success") {
        return NextResponse.redirect(`${origin}/renter/dashboard?success=true`);
    }

    const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const verifyData = await verifyRes.json();

    const paymentSucceeded =
        verifyData.status && verifyData.data.status === "success";

    await supabase
        .from("booking_payments")
        .update({ status: paymentSucceeded ? "success" : "failed" })
        .eq("reference", reference);

    if (!paymentSucceeded) {
        return NextResponse.redirect(`${origin}/renter/dashboard?error=Payment+failed`);
    }

    // 1. Update booking status
    await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", booking.id);

    // 2. Credit the artisan's wallet
    const { data: wallet } = await supabase
        .from("wallets")
        .select("id, balance_pesewas")
        .eq("user_id", booking.artisan_id)
        .single();

    if (wallet) {
        const platformFeePercent = 10; // e.g. 10% platform fee
        const amountToCredit = Math.floor(payment.amount_pesewas * (1 - platformFeePercent / 100));

        await supabase
            .from("wallets")
            .update({ balance_pesewas: wallet.balance_pesewas + amountToCredit })
            .eq("id", wallet.id);

        await supabase.from("wallet_transactions").insert({
            wallet_id: wallet.id,
            type: "credit",
            amount_pesewas: amountToCredit,
            reference: `earning_booking_${booking.id}`,
            description: `Payment for booking by renter (fee deducted)`,
        });
    }

    return NextResponse.redirect(`${origin}/renter/dashboard?success=true`);
}
