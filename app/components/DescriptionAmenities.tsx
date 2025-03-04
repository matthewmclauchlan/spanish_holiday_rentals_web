'use client';
import React from 'react';
import { Models } from 'appwrite';
import Image from 'next/image';

interface PropertyDocument extends Models.Document {
  description?: string;
  amenities?: string[];
}

interface DescriptionAmenitiesProps {
  property: PropertyDocument;
}

// Mapping of amenity keys to custom icon paths.
// Ensure these keys match the strings stored in your Appwrite amenities collection.
const amenityIcons: Record<string, string> = {
    washingmachine: '/assets/icons/washing_machine.png',
    centralheating: '/assets/icons/central_heating.png',
    fridge: '/assets/icons/refrigerator.png',
    coffeemachine: '/assets/icons/coffee_machine.png',
    towels: '/assets/icons/towels.png',
    garden: '/assets/icons/garden (1).png',

  };

const DescriptionAmenities: React.FC<DescriptionAmenitiesProps> = ({ property }) => {
  return (
    <div className="p-4">
      {property.description && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{property.description}</p>
        </div>
      )}
      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">Amenities</h2>
          <ul className="space-y-2">
            {property.amenities.map((amenity, index) => {
              // Normalize amenity string (for example, lower case)
              const key = amenity.toLowerCase();
              // Get icon path or fallback to a default icon
              const iconPath = amenityIcons[key] || '/assets/icons/info.png';
              return (
                <li key={index} className="flex items-center text-gray-700">
                  <div className="relative mr-2" style={{ width: '24px', height: '24px' }}>
                    <Image
                      src={iconPath}
                      alt={`${amenity} icon`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>{amenity}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DescriptionAmenities;



  
