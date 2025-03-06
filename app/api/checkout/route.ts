// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const body = await request.json();
  const {
    lineItems,
    success_url, // expected to be like window.location.origin + '/payment-success?session_id={CHECKOUT_SESSION_ID}'
    cancel_url,
    customerEmail,
    adults,
    children,
    babies,
    cancellationPolicy,
    pets,
  } = body;

  const userId = body.userId || "67c47cfb1993fc5d9914";
  const propertyId = body.propertyId || "67b115860003fbebcf30";
  const checkIn = body.checkIn || "2025-04-01T00:00:00.000Z";
  const checkOut = body.checkOut || "2025-04-07T00:00:00.000Z";

  // Generate a unique bookingReference
  const bookingReference = "BKG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const bookingDate = new Date().toISOString();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url, // Ensure this URL includes '?session_id={CHECKOUT_SESSION_ID}'
      cancel_url,
      customer_email: customerEmail,
      metadata: {
        bookingReference, // Use this key everywhere!
        userId,
        propertyId,
        checkIn,
        checkOut,
        bookingDate,
        // Pass guest details as strings
        adults: adults?.toString() || "1",
        children: children?.toString() || "0",
        babies: babies?.toString() || "0",
        cancellationPolicy,
        pets: pets?.toString() || "0",
      },
    });
    console.log("Created session id:", session.id);
    return NextResponse.json({ id: session.id });
  } catch (error: unknown) {
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error creating checkout session:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
