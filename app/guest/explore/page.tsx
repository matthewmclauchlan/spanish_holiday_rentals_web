'use client';
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useAppwrite } from '../../lib/useAppwrite';
import { getProperties } from '../../lib/appwrite';
import { FilterOptions } from '../../lib/types';
import { Models } from 'appwrite';
import { useDebounce } from '../../../hooks/useDebounce';
import PropertyCard from '../../components/PropertyCard';
import PropertyTypeSlider from '../../components/PropertyTypeSlider';
import { propertyTypes } from '../../lib/PropertyTypes';

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

  // Update the category filter when a property type is selected.
  const handlePropertyTypeSelect = useCallback((type: string) => {
    setFilters((prev) => ({ ...prev, category: type }));
  }, []);

  const debouncedFilters = useDebounce<FilterOptions>(filters, 300);
  const debouncedFiltersString = useMemo(
    () => JSON.stringify(debouncedFilters),
    [debouncedFilters]
  );

  const initialParams = useMemo(
    () => ({
      filter: debouncedFiltersString,
      query: "",
      limit: 10,
    }),
    [debouncedFiltersString]
  );

  const { data: properties, refetch, loading } = useAppwrite<
    Models.Document[] | null,
    { filter: string; query: string; limit: number }
  >({
    fn: getProperties,
    params: initialParams,
    skip: false,
  });

  const prevFiltersRef = useRef(debouncedFiltersString);
  useEffect(() => {
    if (prevFiltersRef.current !== debouncedFiltersString) {
      refetch({
        filter: debouncedFiltersString,
        query: "",
        limit: 10,
      });
      prevFiltersRef.current = debouncedFiltersString;
    }
  }, [debouncedFiltersString, refetch]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev) => ({ ...prev, location: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with search and date filters */}
      <header className="bg-white dark:bg-gray-800 shadow py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Destination..."
            value={filters.location}
            onChange={handleSearchChange}
            className="w-full sm:w-1/3 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                startDate: e.target.value || null,
              }))
            }
            className="w-full sm:w-1/4 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                endDate: e.target.value || null,
              }))
            }
            className="w-full sm:w-1/4 border border-gray-300 dark:border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </header>

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
          <p className="text-center text-lg text-gray-600">
            Loading properties...
          </p>
        )}
        {!loading && properties && properties.length === 0 && (
          <p className="text-center text-lg text-gray-600">
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
