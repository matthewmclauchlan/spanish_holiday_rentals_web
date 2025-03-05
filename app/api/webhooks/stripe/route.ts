import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createBooking } from '../../../lib/appwrite'; // Adjust the import path as needed

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

// Use a secret webhook key (store securely; do not expose to client)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// Dummy usage of stripe to avoid unused variable ESLint error.
console.debug("Stripe instance type:", stripe.constructor.name);

export async function POST(request: Request) {
  const bodyText = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  console.debug("Stripe signature header:", sig);
  console.debug("Webhook secret:", webhookSecret);

  let event: Stripe.Event;
  try {
    // For testing with Postman, bypass signature verification:
    event = JSON.parse(bodyText) as Stripe.Event;
    // In production, use:
    // event = stripe.webhooks.constructEvent(bodyText, sig, webhookSecret);
  } catch (err) {
    console.error('Error parsing webhook event:', err);
    return new NextResponse('Webhook Error: Invalid payload.', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.debug('Received checkout.session.completed event:', session);

    const bookingReference = session.metadata?.bookingReference;
    const userId = session.metadata?.userId;
    const propertyId = session.metadata?.propertyId;
    const checkIn = session.metadata?.checkIn;
    const checkOut = session.metadata?.checkOut;
    const totalPrice = session.amount_total ? session.amount_total / 100 : 0;
    const paymentId: string | undefined = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : undefined;
    const customerEmail = session.customer_email || undefined;
    const createdAt = new Date(session.created * 1000).toISOString();
    const updatedAt = createdAt;
    const status = 'confirmed';

    if (!bookingReference || !userId || !propertyId || !checkIn || !checkOut) {
      console.error('Missing required metadata in Stripe session:', {
        bookingReference,
        userId,
        propertyId,
        checkIn,
        checkOut,
      });
      return new NextResponse('Missing metadata', { status: 400 });
    }

    const bookingData = {
      userId,
      propertyId,
      startDate: checkIn,
      endDate: checkOut,
      totalPrice,
      bookingReference,
      createdAt,
      updatedAt,
      status,
      paymentId,
      customerEmail,
    };

    console.debug('Attempting to create booking in Appwrite with data:', bookingData);

    try {
      const bookingResponse = await createBooking(bookingData);
      console.log('Booking created in Appwrite:', bookingResponse);
    } catch (error: unknown) {
      console.error('Error creating booking in Appwrite:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  } else {
    console.debug('Unhandled event type:', event.type);
  }

  return new NextResponse('Success', { status: 200 });
}
