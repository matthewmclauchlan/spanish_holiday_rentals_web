import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const body = await request.json();
  // Destructure using snake_case keys:
  const {
    lineItems,
    success_url,  // renamed from successUrl
    cancel_url,   // renamed from cancelUrl
    customerEmail,
    adults,
    children,
    babies,
    cancellationPolicy,
    pets,
  } = body;

  // Default test values
  const userId = body.userId || "67c47cfb1993fc5d9914";
  const propertyId = body.propertyId || "67b115860003fbebcf30";
  const checkIn = body.checkIn || "2025-04-01T00:00:00.000Z";
  const checkOut = body.checkOut || "2025-04-07T00:00:00.000Z";

  const bookingReference = "BKG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const bookingDate = new Date().toISOString();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url, // now using the destructured value
      cancel_url,
      customer_email: customerEmail,
      metadata: {
        bookingReference,
        userId,
        propertyId,
        checkIn,
        checkOut,
        bookingDate,
        // Convert guest details to strings:
        adults: adults?.toString() || "1",
        children: children?.toString() || "0",
        babies: babies?.toString() || "0",
        cancellationPolicy,
        pets: pets?.toString() || "0",
      },
    });
    return NextResponse.json({ id: session.id });
  } catch (error: unknown) {
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
