'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Models } from 'appwrite';
import { getImageUrl } from '../lib/appwrite';

interface PropertyCardProps {
  property: Models.Document & {
    mainImage?: string; // File ID stored in Appwrite
    image?: string;
    mediaIds?: string[];
    name?: string;
    pricePerNight?: number;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  // If mainImage exists, use it (converted via getImageUrl), otherwise fall back
  const imageUrl =
    property.mainImage
      ? getImageUrl(property.mainImage)
      : property.image ||
        (property.mediaIds && property.mediaIds.length > 0
          ? getImageUrl(property.mediaIds[0])
          : '/assets/placeholder.png');

  return (
    <Link
      href={`/properties/${property.$id}?view=guest`}
      className="block border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-transparent"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={property.name || 'Property Image'}
          width={400}
          height={300}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">
          {property.name || 'Unnamed Property'}
        </h3>
        {property.pricePerNight !== undefined && (
          <p className="mt-2 text-gray-700">
            ${property.pricePerNight} per night
          </p>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;
