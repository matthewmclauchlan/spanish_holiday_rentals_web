"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  account,
  upsertHostProfile,
  addOwnerRole,
  uploadFile,
  getUserVerificationStatus,
} from "../../../lib/appwrite";
import { useAuth } from "../../../context/AuthContext";

enum WizardStep {
  BASIC_INFO = 0,
  DOC_UPLOAD = 1,
  TERMS = 2,
  REVIEW = 3,
}

interface UserProfile {
  name?: string;
  phone?: string;
  $id: string;
}

export default function HostSignupWizard() {
  const router = useRouter();
  const { user, fetchUser } = useAuth();

  // Wizard state
  const [step, setStep] = useState<WizardStep>(WizardStep.BASIC_INFO);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  // New state: store verification status if already submitted
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  // Check if the user already has a verification submission
  useEffect(() => {
    async function checkVerification() {
      if (user) {
        const status = await getUserVerificationStatus(user.$id);
        setVerificationStatus(status);
      }
    }
    checkVerification();
  }, [user]);

  // Pre-fill basic info when user loads.
  useEffect(() => {
    if (user) {
      // Casting user as a minimal UserProfile type to access phone
      const userProfile = user as UserProfile;
      setFullName(userProfile.name || "");
      setPhone(userProfile.phone || "");
    }
  }, [user]);

  const handleNext = () => {
    setStep((prev) => (prev < WizardStep.REVIEW ? prev + 1 : prev));
  };

  const handleBack = () => {
    setStep((prev) => (prev > WizardStep.BASIC_INFO ? prev - 1 : prev));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocFile(e.target.files[0]);
    }
  };

  const handleFinalSubmit = async () => {
    setError(null);
    if (!fullName.trim() || !phone.trim()) {
      setError("Full name and phone number are required.");
      return;
    }
    // If the user hasn't submitted an ID yet, ensure a file is selected.
    if (!verificationStatus && !docFile) {
      setError("Please upload your government-issued ID.");
      return;
    }
    if (!hasReadTerms || !acceptTerms) {
      setError("You must read and accept the terms before submitting.");
      return;
    }
    try {
      let fileUrl = "";
      // Only upload file if user hasn't already submitted one.
      if (!verificationStatus && docFile) {
        const uploadResponse = await uploadFile(docFile);
        fileUrl = uploadResponse.$id;
      } else if (verificationStatus) {
        // Optionally, you could retrieve the existing file URL from the verification record.
        // For now, we simply note that an ID was already submitted.
        fileUrl = ""; // or leave empty to indicate no new upload.
      }
      const currentUser = await account.get();
      await upsertHostProfile({
        userId: currentUser.$id,
        fullName,
        phoneNumber: phone,
        hostDocumentUrl: fileUrl,
        termsAccepted: acceptTerms,
      });
      await addOwnerRole(currentUser.$id);
      await fetchUser();
      router.replace("/(guest)/applicationProcessing");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit host application.";
      setError(errorMessage);
    }
  };

  const TermsModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Terms of Service</h2>
        <div className="overflow-y-auto max-h-64 text-sm">
          <p>
            [Placeholder: Please review the full Terms of Service here. You must read all terms carefully before acceptance.]
          </p>
        </div>
        <button
          onClick={() => {
            setHasReadTerms(true);
            setShowTermsModal(false);
          }}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          I Have Read the Terms
        </button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen p-4 dark:bg-gray-900 dark:text-gray-100">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Become a Host</h1>
        {error && <p className="text-red-500">{error}</p>}

        {step === WizardStep.BASIC_INFO && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Basic Info</h2>
            <label className="block mb-2 text-gray-800 dark:text-gray-100">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your legal name"
              className="w-full border rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:text-gray-100"
              required
            />
            <label className="block mb-2 text-gray-800 dark:text-gray-100">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full border rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>
        )}

        {step === WizardStep.DOC_UPLOAD && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Upload ID</h2>
            {verificationStatus ? (
              <p className="mb-2 text-green-600">
                Your ID has already been submitted. Status: {verificationStatus}.
              </p>
            ) : (
              <>
                <p className="mb-2">Please upload a clear photo of your government-issued ID.</p>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <p className="mt-2 text-sm text-gray-600">
                  {docFile ? `File selected: ${docFile.name}` : "No file selected."}
                </p>
              </>
            )}
          </div>
        )}

        {step === WizardStep.TERMS && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 3: Terms & Conditions</h2>
            <p className="mb-4">
              Please review our{" "}
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-blue-600 underline"
              >
                Terms of Service
              </button>{" "}
              and indicate your acceptance.
            </p>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mr-2"
              />
              <span>I accept the Terms of Service</span>
            </div>
            {!hasReadTerms && (
              <p className="mt-2 text-sm text-gray-600">
                You must read the terms before accepting.
              </p>
            )}
          </div>
        )}

        {step === WizardStep.REVIEW && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 4: Review & Submit</h2>
            <p className="mb-2">Full Name: {fullName}</p>
            <p className="mb-2">Phone: {phone}</p>
            <p className="mb-2">
              ID File:{" "}
              {docFile ? docFile.name : verificationStatus ? "Previously Submitted" : "None"}
            </p>
            <p className="mb-2">Terms Accepted: {acceptTerms ? "Yes" : "No"}</p>
          </div>
        )}

        <div className="flex justify-between">
          {step > WizardStep.BASIC_INFO && (
            <button
              onClick={handleBack}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Back
            </button>
          )}
          {step < WizardStep.REVIEW ? (
            <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={!acceptTerms || !hasReadTerms}
            >
              Submit
            </button>
          )}
        </div>

        {showTermsModal && !hasReadTerms && <TermsModal />}
      </div>
    </div>
  );
}
