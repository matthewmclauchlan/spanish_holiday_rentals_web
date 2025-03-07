'use client';
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import axios from 'axios';
import { storage, config } from '../lib/appwrite';

const UserVerificationForm: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!file) {
      alert("Please select an image of yourself holding your ID.");
      return;
    }
    setUploading(true);
    setMessage('');
    
    try {
      console.log("Using bucket:", config.verificationBucketId);
      // Upload the file to Appwrite storage.
      const uploadResponse = await storage.createFile(
        config.verificationBucketId, // Ensure this is correct.
        'unique()', // Let Appwrite generate a unique ID
        file
      );
      console.log("Upload response:", uploadResponse);

      // Construct a public URL for the uploaded file.
      const imageUrl = `${config.endpoint}/storage/buckets/${config.verificationBucketId}/files/${uploadResponse.$id}/view?project=${config.projectId}`;
      // Prepare the verification data.
      const verificationData = {
        userId: user.$id,
        verificationImage: imageUrl,
        status: "pending",
      };

      await axios.post('/api/sendVerificationToGlide', verificationData);
      setMessage("Verification information submitted. Await approval.");
    } catch (error) {
      console.error("Error submitting verification data", error);
      setMessage("Error submitting verification data. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="flex flex-col items-center">
        <Image
          src="/assets/images/idpicture.png"
          alt="Verification instructions"
          width={500}
          height={500}
        />
        <p className="mt-4 text-center text-sm text-gray-600">
          To comply with local authorities, please upload a photo of yourself holding your valid ID.
          This helps ensure the safety of all guests.
        </p>
      </div>
      <div>
        <label htmlFor="verificationImage" className="block text-sm font-medium text-gray-900">
          Upload Photo (Selfie with ID)
        </label>
        <input
          id="verificationImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          required
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 flex items-center justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          <Image
            src="/assets/icons/upload.png"
            alt="Upload icon"
            width={20}
            height={20}
            className="mr-2"
          />
          {file ? "Change Selected File" : "Choose File"}
        </button>
        {file && (
          <p className="mt-1 text-sm text-gray-500">
            Selected File: {file.name}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
      >
        {uploading ? "Submitting..." : "Submit Verification"}
      </button>
      {message && <p className="mt-2 text-center text-sm text-gray-700">{message}</p>}
    </form>
  );
};

export default UserVerificationForm;
