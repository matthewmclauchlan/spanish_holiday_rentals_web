"use client";

import React, { useEffect, useState } from 'react';
import { account } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import { getAvatarUrl } from '../../lib/appwrite';

export default function SupportProfilePage() {
  const { user, updateAvatar } = useAuth();
  const [phone, setPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState('');
  const [editingPassword, setEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await account.get();
        setPhone(userData.phone || '');
      } catch {
        setError('Error fetching user data');
      }
    }
    fetchUser();
  }, []);

  const handleSavePhone = async () => {
    if (!phone.startsWith('+')) {
      setPhoneMessage("Phone number must start with a '+' and include the country code.");
      return;
    }
    const digits = phone.slice(1);
    if (!/^\d+$/.test(digits)) {
      setPhoneMessage("Phone number must contain only digits after the '+'");
      return;
    }
    if (digits.length > 15) {
      setPhoneMessage("Phone number can have a maximum of 15 digits.");
      return;
    }
    try {
      await account.updatePhone(phone, phonePassword);
      const updatedUser = await account.get();
      setPhone(updatedUser.phone || phone);
      setPhoneMessage('Phone number updated.');
      setEditingPhone(false);
    } catch {
      setPhoneMessage('Error updating phone number. Please ensure your credentials are correct.');
    }
  };

  const handleSavePassword = async () => {
    if (newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters long.');
      return;
    }
    try {
      await account.updatePassword(newPassword, oldPassword);
      setPasswordMessage('Password updated.');
      setEditingPassword(false);
      setOldPassword('');
      setNewPassword('');
    } catch {
      setPasswordMessage('Error updating password. Please ensure your current password is correct.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    try {
      await updateAvatar(selectedFile);
    } catch (error) {
      console.error("Error uploading avatar", error);
    }
  };

  return (
    <div className="text-white max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Support Profile Information</h2>
      {user ? (
        <div className="space-y-6">
          {/* Avatar Upload Section */}
          <div className="flex items-center border-b border-gray-300 pb-4">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-gray-500 rounded-full overflow-hidden">
                {user.avatarUrl ? (
                  <Image
                    alt="User avatar"
                    src={getAvatarUrl(user.avatarUrl)}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-2xl text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4 flex flex-col">
              <label 
                htmlFor="avatarInput" 
                className="cursor-pointer inline-block bg-gray-600 text-white rounded-md px-4 py-1 hover:bg-gray-700"
              >
                Choose File
              </label>
              <input
                type="file"
                id="avatarInput"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <button
                onClick={handleUploadAvatar}
                className="mt-2 bg-green-600 text-white rounded-md px-4 py-1 cursor-pointer"
              >
                Upload Avatar
              </button>
            </div>
          </div>
          {/* Name Section */}
          <div className="flex justify-between border-b border-gray-300 pb-4">
            <p><strong>Name:</strong> {user.name}</p>
            <button onClick={() => alert("Edit Name")} className="ml-2 text-blue-600 hover:underline">Edit</button>
          </div>
          {/* Email Section */}
          <div className="flex justify-between border-b border-gray-300 pb-4">
            <p><strong>Email:</strong> {user.email}</p>
            <button onClick={() => alert("Edit Email")} className="ml-2 text-blue-600 hover:underline">Edit</button>
          </div>
          {/* Support ID Section */}
          <div className="flex justify-between border-b border-gray-300 pb-4">
            <p><strong>Support ID:</strong> {user.$id}</p>
          </div>
          {/* Phone Section */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-4">
            <p><strong>Phone:</strong> {phone || 'Not Provided'}</p>
            {editingPhone ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-md border px-2 py-1"
                  placeholder="+1234567890"
                />
                <input
                  type="password"
                  value={phonePassword}
                  onChange={(e) => setPhonePassword(e.target.value)}
                  className="rounded-md border px-2 py-1"
                  placeholder="Enter current password"
                />
                <button onClick={handleSavePhone} className="ml-2 bg-green-600 text-white rounded-md px-3 py-1">
                  Save
                </button>
              </div>
            ) : (
              <button onClick={() => { setPhoneMessage(''); setEditingPhone(true); }} className="text-blue-600 hover:underline">
                Edit Phone
              </button>
            )}
          </div>
          {phoneMessage && <p className="mt-2 text-sm text-green-600">{phoneMessage}</p>}
          {/* Password Section */}
          <div className="flex justify-between items-center border-b border-gray-300 pb-4">
            <p><strong>Password:</strong> *********</p>
            {editingPassword ? (
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="rounded-md border px-2 py-1"
                  placeholder="Current password"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-md border px-2 py-1"
                  placeholder="New password"
                />
                <button onClick={handleSavePassword} className="ml-2 bg-green-600 text-white rounded-md px-3 py-1">
                  Save Password
                </button>
              </div>
            ) : (
              <button onClick={() => { setPasswordMessage(''); setEditingPassword(true); }} className="text-blue-600 hover:underline">
                Edit Password
              </button>
            )}
          </div>
          {passwordMessage && <p className="mt-2 text-sm text-green-600">{passwordMessage}</p>}
        </div>
      ) : (
        <p>Loading personal information...</p>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
