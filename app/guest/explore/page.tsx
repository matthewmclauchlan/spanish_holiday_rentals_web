'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAppwrite } from '../../lib/useAppwrite';
import { getProperties } from '../../lib/appwrite';
import { FilterOptions } from '../../lib/types';
import { Models } from 'appwrite';
import { useDebounce } from '../../../hooks/useDebounce';
import PropertyCard from '../../components/PropertyCard';
import PropertyTypeSlider from '../../components/PropertyTypeSlider';
import { propertyTypes } from '../../lib/PropertyTypes';
import { Dialog } from '@headlessui/react';

interface PropertyDocument extends Models.Document {
  image?: string;
  name?: string;
  description?: string;
}

export default function ExplorePage() {
  const [filters, setFilters] = useState<FilterOptions>({
    category: "All",
    location: "",
    priceMin: 50,
    priceMax: 500,
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    guestCount: 1,
    startDate: null,
    endDate: null,
  });
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const popularDestinations = ["Madrid", "Valencia", "Barcelona", "Seville"];
  const [userLocation, setUserLocation] = useState<string | null>(null);

  // Use Geolocation API to optionally get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Here you might call a reverse geocoding API to get a human-readable location.
          // For this example, we'll just store a placeholder string.
          setUserLocation("Around Me");
        },
        () => {
          setUserLocation(null);
        }
      );
    }
  }, []);

  const handleDestinationSelect = (destination: string) => {
    setFilters((prev) => ({ ...prev, location: destination }));
    setIsSearchModalOpen(false);
  };

  // The rest of your filtering logic remains unchanged...
  const handlePropertyTypeSelect = useCallback((type: string) => {
    setFilters((prev) => ({ ...prev, category: type }));
  }, []);

  const debouncedFilters = useDebounce<FilterOptions>(filters, 300);
  const debouncedFiltersString = JSON.stringify(debouncedFilters);

  const initialParams = {
    filter: debouncedFiltersString,
    query: "",
    limit: 10,
  };

  const { data: properties, refetch, loading } = useAppwrite<
    Models.Document[] | null,
    { filter: string; query: string; limit: number }
  >({
    fn: getProperties,
    params: initialParams,
    skip: false,
  });

  // Listen for changes in the debounced filter string
  React.useEffect(() => {
    refetch({
      filter: debouncedFiltersString,
      query: "",
      limit: 10,
    });
  }, [debouncedFiltersString, refetch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, location: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative">
      {/* Header with search and date filters */}
      <header className="bg-white dark:bg-gray-800 shadow py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          {/* Destination Search Box */}
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Destination..."
              value={filters.location}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchModalOpen(true)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            {/* Optional: Display current filter if user typed something */}
          </div>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value || null }))
            }
            className="w-full sm:w-1/4 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value || null }))
            }
            className="w-full sm:w-1/4 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </header>

      {/* Search Modal for Destination Options */}
      <Dialog
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white text-center">
              Choose Your Destination
            </Dialog.Title>
            <div className="mt-4">
              {userLocation && (
                <button
                  onClick={() => handleDestinationSelect(userLocation)}
                  className="w-full mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                >
                  Around Me
                </button>
              )}
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300 mb-2">
                Popular Destinations
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {popularDestinations.map((dest, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDestinationSelect(dest)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {dest}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsSearchModalOpen(false)}
                  className="text-indigo-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Property Type Slider */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <PropertyTypeSlider
          types={propertyTypes}
          selectedType={filters.category}
          onSelect={handlePropertyTypeSelect}
        />
      </div>

      {/* Main content: Property Listings */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        {loading && (
          <p className="text-center text-lg text-gray-600 dark:text-gray-300">
            Loading properties...
          </p>
        )}
        {!loading && properties && properties.length === 0 && (
          <p className="text-center text-lg text-gray-600 dark:text-gray-300">
            No properties match your filters.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties &&
            properties.map((property: Models.Document) => {
              const prop = property as PropertyDocument;
              return <PropertyCard key={property.$id} property={prop} />;
            })}
        </div>
      </main>

      {/* Spacer at Bottom */}
      <div className="h-20"></div>
    </div>
  );
}
