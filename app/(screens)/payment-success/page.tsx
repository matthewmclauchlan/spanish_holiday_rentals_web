import React, { Suspense } from 'react';
import PaymentSuccess from './PaymentSuccess';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading payment details...</div>}>
      <PaymentSuccess />
    </Suspense>
  );
}
