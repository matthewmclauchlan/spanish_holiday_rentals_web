import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createBooking } from '../../../lib/appwrite'; // Adjust the path if needed.
import { sendBookingToGlide } from '../../../lib/sendBookingToGlide'; // Adjust the path if needed.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: Request) {
  const bodyText = await request.text();
  const sig = request.headers.get('stripe-signature') || '';

  console.debug("Stripe signature header:", sig);
  console.debug("Webhook secret:", webhookSecret);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(bodyText, sig, webhookSecret);
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    return new NextResponse('Webhook Error: Invalid signature.', { status: 400 });
  }

  console.debug('Received event:', event);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.debug('Processing checkout.session.completed event:', session);

    // Extract metadata from the Stripe session
    const bookingReference = session.metadata?.bookingReference;
    const userId = session.metadata?.userId;
    const propertyId = session.metadata?.propertyId;
    const checkIn = session.metadata?.checkIn;
    const checkOut = session.metadata?.checkOut;
    const totalPrice = session.amount_total ? session.amount_total / 100 : 0;
    const paymentId: string | undefined =
      typeof session.payment_intent === 'string' ? session.payment_intent : undefined;
    const customerEmail = session.customer_email || undefined;
    const createdAt = new Date(session.created * 1000).toISOString();
    const updatedAt = createdAt;
    const status = 'confirmed';

    // Extract guest details from metadata
    const adults = parseInt(session.metadata?.adults || "1", 10);
    const children = parseInt(session.metadata?.children || "0", 10);
    const babies = parseInt(session.metadata?.babies || "0", 10);
    const cancellationPolicy = session.metadata?.cancellationPolicy || "strict";
    const pets = parseInt(session.metadata?.pets || "0", 10);

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

    // Build the bookingData object
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
      // Guest details:
      adults,
      children,
      babies,
      cancellationPolicy,
      pets,
    };

    console.debug('Attempting to create booking in Appwrite with data:', bookingData);

    try {
      // Create booking in Appwrite
      const bookingResponse = await createBooking(bookingData);
      console.log('Booking created in Appwrite:', bookingResponse);

      // Now manually trigger the Glide integration
      console.log("Now triggering sendBookingToGlide with bookingData...");
      const glideResult = await sendBookingToGlide(bookingData);
      console.log('Glide function response:', glideResult);

    } catch (error: unknown) {
      console.error('Error creating booking in Appwrite or sending to Glide:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  } else {
    console.debug('Unhandled event type:', event.type);
  }

  return new NextResponse('Success', { status: 200 });
}
