'use client';

import React, { useEffect, useState } from 'react';
import UserVerificationForm from '../../../components/GuestVerificationForm';
import { getUserVerificationStatus } from '../../../lib/appwrite';
import { useAuth } from '../../../context/AuthContext';

export default function VerificationPage() {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function checkVerification() {
      if (user) {
        // getUserVerificationStatus should return a status string (e.g., "approved")
        const status = await getUserVerificationStatus(user.$id);
        if (status && status.toLowerCase() === 'approved') {
          setVerified(true);
        }
      }
    }
    checkVerification();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">Account Verification</h2>
      {verified ? (
        <div className="flex flex-col items-center justify-center p-4 border rounded bg-green-100">
          <h3 className="text-lg font-semibold text-green-800">Your account is verified!</h3>
          <p className="mt-2 text-green-700">You now have full access to all features.</p>
        </div>
      ) : (
        <>
          <p className="mb-2">
            Please upload an image of yourself holding your ID. This information is required by local authorities to complete your account verification.
          </p>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Instructions</h3>
            <ul className="list-disc pl-5">
              <li>Ensure your ID is clear and legible.</li>
              <li>Hold the ID next to your face to verify your identity.</li>
              <li>Acceptable forms of ID: Passport, Driver’s License, National ID card.</li>
            </ul>
          </div>
          <UserVerificationForm />
        </>
      )}
    </div>
  );
}
