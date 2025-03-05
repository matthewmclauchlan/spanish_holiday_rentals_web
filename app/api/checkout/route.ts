import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const body = await request.json();
  const { lineItems, successUrl, cancelUrl, customerEmail } = body;

  // Use the test values provided:
  const userId = "67c47cfb1993fc5d9914"; // Test user ID
  const propertyId = "67b115860003fbebcf30"; // Test property ID
  const checkIn = "2025-04-01T00:00:00.000Z";
  const checkOut = "2025-04-07T00:00:00.000Z";

  // Generate a booking reference.
  const bookingReference = "BKG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const bookingDate = new Date().toISOString();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        bookingReference,
        userId,
        propertyId,
        checkIn,
        checkOut,
        bookingDate,
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
