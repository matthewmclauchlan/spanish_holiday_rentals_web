'use client';

import React, { useEffect, useState } from 'react';
import { account, databases, config } from '../../lib/appwrite';
import { Query, Models } from 'appwrite';
import UserVerificationForm from '../../components/GuestVerificationForm';

interface Booking extends Models.Document {
  bookingReference: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
}

// Extend AppwriteUser to include an optional phone property.
interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  phone?: string;
}

function AccountInfo({ user }: { user: AppwriteUser }) {
  // State for phone update
  const [phone, setPhone] = useState(user.phone || '');
  const [phonePassword, setPhonePassword] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState('');

  // State for password update
  const [editingPassword, setEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  // Handle phone update with client-side validation
  const handleSavePhone = async () => {
    if (!phone.startsWith('+')) {
      setPhoneMessage("Phone number must start with a '+' and include the country code.");
      return;
    }
    const digits = phone.slice(1);
    if (!/^\d+$/.test(digits)) {
      setPhoneMessage("Phone number must contain only digits after the '+'.");
      return;
    }
    if (digits.length > 15) {
      setPhoneMessage("Phone number can have a maximum of 15 digits (excluding '+').");
      return;
    }
    try {
      // Update phone number; note we don't need to assign the result since it's not used.
      await account.updatePhone(phone, phonePassword);
      const updatedUser = await account.get();
      setPhone(updatedUser.phone || phone);
      setPhoneMessage('Phone number updated.');
      setEditingPhone(false);
    } catch (error) {
      console.error('Error updating phone number:', error);
      setPhoneMessage('Error updating phone number. Please ensure your credentials are correct.');
    }
  };

  // Handle password update with minimal validation
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
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage('Error updating password. Please ensure your current password is correct.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Account Information</h2>
      <p>
        <strong>Name:</strong> {user.name}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {/* Phone Update Section */}
      <p>
        <strong>Phone:</strong>{' '}
        {editingPhone ? (
          <>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-2 py-1"
              placeholder="+1234567890"
            />
            <input
              type="password"
              value={phonePassword}
              onChange={(e) => setPhonePassword(e.target.value)}
              className="ml-2 mt-1 rounded-md border border-gray-300 px-2 py-1"
              placeholder="Enter current password"
            />
            <button
              onClick={handleSavePhone}
              className="ml-2 rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-500"
            >
              Save
            </button>
          </>
        ) : (
          <>
            {phone || 'Not Provided'}
            <button
              onClick={() => {
                setPhoneMessage('');
                setEditingPhone(true);
              }}
              className="ml-2 rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
            >
              Edit Phone
            </button>
          </>
        )}
      </p>
      {phoneMessage && <p className="mt-2 text-sm text-green-600">{phoneMessage}</p>}
      {/* Password Update Section */}
      <p className="mt-4">
        <strong>Password:</strong>{' '}
        {editingPassword ? (
          <>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-2 py-1"
              placeholder="Current password"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="ml-2 mt-1 rounded-md border border-gray-300 px-2 py-1"
              placeholder="New password"
            />
            <button
              onClick={handleSavePassword}
              className="ml-2 rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-500"
            >
              Save Password
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setPasswordMessage('');
              setEditingPassword(true);
            }}
            className="rounded-md bg-blue-600 px-3 py-1 text-white hover:bg-blue-500"
          >
            Edit Password
          </button>
        )}
      </p>
      {passwordMessage && <p className="mt-2 text-sm text-green-600">{passwordMessage}</p>}
    </div>
  );
}

function BillingDetails() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Billing Details</h2>
      <p>
        <strong>Payment Method:</strong> Visa ending in 4242
      </p>
      <p>
        <strong>Subscription:</strong> Premium Plan
      </p>
      <p>
        <strong>Next Payment:</strong> 2025-04-01
      </p>
    </div>
  );
}

function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const user = await account.get();
        const response = await databases.listDocuments<Booking>(
          config.databaseId,
          config.bookingsCollectionId,
          [Query.equal('userId', user.$id)]
        );
        setBookings(response.documents);
      } catch (err: unknown) {
        let errorMessage = 'Unable to load bookings.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading) return <p>Loading booking history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Booking History</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2">
          {bookings.map((booking) => (
            <li key={booking.$id} className="bg-white p-4 rounded shadow">
              <p>
                <strong>Booking Reference:</strong> {booking.bookingReference}
              </p>
              <p>
                <strong>Dates:</strong>{' '}
                {new Date(booking.startDate).toLocaleDateString()} -{' '}
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {booking.status}
              </p>
              <p>
                <strong>Total Price:</strong> €{booking.totalPrice.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<'account' | 'billing' | 'bookings' | 'verification'>('account');
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [userError, setUserError] = useState<string>('');

  useEffect(() => {
    account
      .get()
      .then((response) => setUser(response as unknown as AppwriteUser))
      .catch((err) => {
        console.error('Error fetching user details:', err);
        setUserError('Error fetching user details.');
      });
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white text-black p-4 border-r">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveSection('account')}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeSection === 'account' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            Account Information
          </button>
          <button
            onClick={() => setActiveSection('billing')}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeSection === 'billing' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            Billing Details
          </button>
          <button
            onClick={() => setActiveSection('bookings')}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeSection === 'bookings' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            Booking History
          </button>
          <button
            onClick={() => setActiveSection('verification')}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeSection === 'verification' ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            Verification
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-white text-black">
        {activeSection === 'account' && (
          <>
            {userError && <p className="text-red-500">{userError}</p>}
            {user ? <AccountInfo user={user} /> : <p>Loading account information...</p>}
          </>
        )}
        {activeSection === 'billing' && <BillingDetails />}
        {activeSection === 'bookings' && <BookingHistory />}
        {activeSection === 'verification' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Account Verification</h2>
            <p className="mb-2">
              Please upload an image of yourself holding your ID. This information is required by local authorities.
            </p>
            <UserVerificationForm />
          </div>
        )}
      </main>
    </div>
  );
}