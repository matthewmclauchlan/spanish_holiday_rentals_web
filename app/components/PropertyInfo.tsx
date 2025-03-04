'use client';

import React from 'react';
import { Models } from 'appwrite';

interface PropertyDocument extends Models.Document {
  name?: string;
  address?: string;
  type?: string;
  rating?: string;
  // Add other fields as needed
}

interface PropertyInfoProps {
  property: PropertyDocument;
}

const PropertyInfo: React.FC<PropertyInfoProps> = ({ property }) => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">{property.name || 'No name available'}</h1>
      <p className="text-gray-600">{property.address || 'Location not available'}</p>
      <p className="text-gray-600">{property.type || 'Unknown Type'}</p>
      <p className="text-gray-600">⭐ {property.rating || 'No Rating'}</p>
      <div className="mt-4">
      </div>
    </div>
  );
};

export default PropertyInfo;
