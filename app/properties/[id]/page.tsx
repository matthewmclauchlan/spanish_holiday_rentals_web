'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  getPropertyById,
  getImageUrl,
  getReviewsForProperty,
  getBookingsForProperty,
  getBookingRulesForProperty,
} from '../../lib/appwrite';
import { PropertyDocument, Review, Booking, BookingRules } from '../../lib/types';
import BookingFlowModal from '../../components/BookingFlowModal';
import ImageSlider from '../../components/ImageSlider';
import PropertyInfo from '../../components/PropertyInfo';
import DescriptionAmenities from '../../components/DescriptionAmenities';
import MapComponent from '../../components/MapComponent';
import Reviews from '../../components/Reviews';
import BookingCard from '../../components/BookingCard';

const IMAGE_SLIDER_HEIGHT = 300;

const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();

  const [property, setProperty] = useState<PropertyDocument | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingRules, setBookingRules] = useState<BookingRules | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError('No valid property ID provided');
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      getPropertyById(id),
      getReviewsForProperty(id),
      getBookingsForProperty(id),
      getBookingRulesForProperty(id),
    ])
      .then(([prop, revs, book, rules]) => {
        if (!prop) {
          setError('Property not found');
        } else {
          setProperty(prop as unknown as PropertyDocument);
          setReviews(revs);
          setBookings(book);
          setBookingRules(rules);
          console.log("Bookings retrieved:", book);
          console.log("Booking Rules retrieved:", rules);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error fetching property')
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleReserveNow = () => {
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error: {error || 'Property not found'}</p>
      </div>
    );
  }

  let lat: number | null = null;
  let lng: number | null = null;
  if (property.geolocation && typeof property.geolocation === 'string') {
    const parts = property.geolocation.split(',');
    if (parts.length === 2) {
      lat = parseFloat(parts[0].trim());
      lng = parseFloat(parts[1].trim());
    }
  }

  const imageUrls =
    property.mediaIds && property.mediaIds.length > 0
      ? property.mediaIds.map((id) => getImageUrl(id))
      : [];
  console.log('Image URLs:', imageUrls);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Image Slider Component */}
      <ImageSlider images={imageUrls} height={IMAGE_SLIDER_HEIGHT} />

      {/* Header Overlay (Back button) */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.back()}
          className="bg-black bg-opacity-50 p-2 rounded-full"
        >
          <Image src="/assets/icons/cross.png" alt="Back" width={20} height={20} />
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="px-4 py-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <PropertyInfo property={property} />
          <DescriptionAmenities property={property} />
          {lat !== null && lng !== null && (
            <MapComponent lat={lat} lng={lng} height={300} />
          )}
          <Reviews reviews={reviews} />
        </div>

        {/* Right Column: Booking Card */}
        <div className="relative">
          <div className="sticky top-4 self-start">
            <BookingCard
              pricePerNight={property.pricePerNight}
              bookings={bookings}
              bookingRules={bookingRules}
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center">
        <button
          onClick={handleReserveNow}
          className="bg-indigo-600 text-white px-6 py-3 rounded-full"
        >
          Reserve Now
        </button>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingFlowModal
          property={property}
          onClose={() => setShowBookingModal(false)}
          onConfirm={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetailsPage;
