import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: Request) {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const hash = crypto
        .createHmac("sha512", secret)
        .update(rawBody)
        .digest("hex");

    if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
        const reference = event.data.reference;

        // Use service role key to bypass RLS for webhooks
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: payment } = await supabase
            .from("boost_payments")
            .select("*")
            .eq("reference", reference)
            .single();

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        // Idempotency check
        if (payment.status === "success") {
            return NextResponse.json({ status: "already processed" });
        }

        const paymentSucceeded = event.data.status === "success";

        // Update payment status
        await supabase
            .from("boost_payments")
            .update({ status: paymentSucceeded ? "success" : "failed" })
            .eq("reference", reference);

        if (paymentSucceeded) {
            const boostedUntil = new Date();
            boostedUntil.setDate(boostedUntil.getDate() + payment.days);

            const table = payment.target_type === "listing" ? "listings" : "artisan_profiles";
            await supabase
                .from(table)
                .update({ boosted_until: boostedUntil.toISOString() })
                .eq("id", payment.target_id);
        }

        return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "ignored" });
}
