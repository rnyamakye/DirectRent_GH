import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
        return NextResponse.redirect(`${origin}/agent/boost/failed?reason=Missing+reference`);
    }

    const supabase = await createClient();

    // Look up OUR OWN record of this reference first — this is the
    // "always verify server-side" step. We never trust Paystack's
    // redirect alone; we ask Paystack directly whether this specific
    // reference actually succeeded before touching the database.
    const { data: payment } = await supabase
        .from("boost_payments")
        .select("*")
        .eq("reference", reference)
        .single();

    if (!payment) {
        return NextResponse.redirect(`${origin}/agent/boost/failed?reason=Unknown+payment`);
    }

    const failureUrl =
        payment.target_type === "listing" ? "/agent/boost/failed" : "/artisan/boost/failed";
    const successUrl =
        payment.target_type === "listing" ? "/agent/boost/success" : "/artisan/boost/success";

    const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const verifyData = await verifyRes.json();

    const paymentSucceeded =
        verifyData.status && verifyData.data.status === "success";

    await supabase
        .from("boost_payments")
        .update({ status: paymentSucceeded ? "success" : "failed" })
        .eq("reference", reference);

    if (!paymentSucceeded) {
        return NextResponse.redirect(`${origin}${failureUrl}?reason=Payment+not+completed`);
    }

    const boostedUntil = new Date();
    boostedUntil.setDate(boostedUntil.getDate() + payment.days);

    const table = payment.target_type === "listing" ? "listings" : "artisan_profiles";
    await supabase
        .from(table)
        .update({ boosted_until: boostedUntil.toISOString() })
        .eq("id", payment.target_id);

    const params = new URLSearchParams({ days: String(payment.days) });
    if (payment.target_type === "listing") params.set("listingId", payment.target_id);

    return NextResponse.redirect(`${origin}${successUrl}?${params.toString()}`);
}