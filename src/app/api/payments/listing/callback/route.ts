import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    if (!reference || !trxref) {
        return NextResponse.redirect(`${origin}/agent/listings?payment=invalid`);
    }

    const supabase = await createClient();

    // Look up our internal payment attempt
    const { data: payment } = await supabase
        .from("listing_payments")
        .select("*")
        .eq("reference", reference)
        .single();

    if (!payment) {
        return NextResponse.redirect(`${origin}/agent/listings?payment=not_found`);
    }

    // Already processed? (Prevents double-crediting if user refreshes the page)
    if (payment.status !== "pending") {
        return NextResponse.redirect(`${origin}/agent/listings`);
    }

    // Verify actual outcome directly with Paystack Server-to-Server
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
    });

    const verifyData = await verifyRes.json();
    const paymentSucceeded =
        verifyData.status &&
        verifyData.data.status === "success" &&
        verifyData.data.amount >= payment.amount_pesewas;

    // Update payment status
    await supabase
        .from("listing_payments")
        .update({ status: paymentSucceeded ? "success" : "failed" })
        .eq("id", payment.id);

    if (!paymentSucceeded) {
        return NextResponse.redirect(`${origin}/agent/listings?payment=failed`);
    }

    // Update the listing status to 'available' since payment succeeded
    const { error: updateError } = await supabase
        .from("listings")
        .update({ status: "available" })
        .eq("id", payment.listing_id);
        
    if (updateError) {
        console.error("Failed to make listing available:", updateError);
        return NextResponse.redirect(`${origin}/agent/listings?payment=error`);
    }

    return NextResponse.redirect(`${origin}/agent/listings?payment=success`);
}
