'use client';

import React from 'react';
import UserVerificationForm from '../../../components/GuestVerificationForm'; // Assuming the form is located here

export default function VerificationPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">Account Verification</h2>
      <p className="mb-2">
        Please upload an image of yourself holding your ID. This information is required by local authorities to complete your account verification.
      </p>
      
      {/* Verification instructions */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <ul className="list-disc pl-5">
          <li>Ensure your ID is clear and legible.</li>
          <li>Hold the ID next to your face to verify your identity.</li>
          <li>Acceptable forms of ID: Passport, Driver’s License, National ID card.</li>
        </ul>
      </div>

      {/* UserVerificationForm to handle the upload process */}
      <UserVerificationForm />
    </div>
  );
}
