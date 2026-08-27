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

    const { bookingId, amountGhs } = await request.json();

    if (!bookingId || !amountGhs) {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const amountPesewas = amountGhs * 100;

    // Verify booking belongs to user
    const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();
        
    if (!booking || booking.renter_id !== user.id) {
        return NextResponse.json({ error: "Booking not found or not owned by you." }, { status: 403 });
    }

    if (booking.payment_status === "paid") {
        return NextResponse.json({ error: "Booking is already paid." }, { status: 400 });
    }

    const reference = `booking_${crypto.randomUUID()}`;

    const { error: insertError } = await supabase.from("booking_payments").insert({
        booking_id: bookingId,
        renter_id: user.id,
        amount_pesewas: amountPesewas,
        reference,
    });

    if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Update the booking amount to match what was initialized
    await supabase.from("bookings").update({ amount_pesewas: amountPesewas }).eq("id", bookingId);

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
            callback_url: `${origin}/api/payments/booking/callback`,
        }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
        return NextResponse.json({ error: "Could not start payment." }, { status: 500 });
    }

    return NextResponse.json({ authorizationUrl: paystackData.data.authorization_url });
}
