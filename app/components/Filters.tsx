"use client";
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { IoFilterSharp } from "react-icons/io5"; // Ensure you run: npm install react-icons

export interface FilterOptions {
  category: string;
  location: string;
  priceMin: number;
  priceMax: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  guestCount: number;
  startDate: string | null;
  endDate: string | null;
}

interface FiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const categories = [
  { category: "All", title: "All" },
  { category: "Apartment", title: "Apartment" },
  { category: "House", title: "House" },
  { category: "Villa", title: "Villa" },
  { category: "Farmhouse", title: "Farmhouse" },
];

const amenitiesList = [
  "WiFi",
  "Pool",
  "Air Conditioning",
  "Parking",
  "Gym",
  "Kitchen",
];

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Additional filter states
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([50, 500]);
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(1);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const applyFilters = () => {
    onFilterChange({
      category: selectedCategory,
      location,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      bedrooms,
      bathrooms,
      amenities: selectedAmenities,
      guestCount,
      startDate,
      endDate,
    });
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setLocation("");
    setPriceRange([50, 500]);
    setBedrooms(0);
    setBathrooms(0);
    setSelectedAmenities([]);
    setGuestCount(1);
    setStartDate(null);
    setEndDate(null);
    onFilterChange({
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
    setIsModalOpen(false);
  };

  return (
    <div className="mb-4">
      {/* Horizontal Category Buttons */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedCategory(item.category);
              onFilterChange({
                category: item.category,
                location,
                priceMin: priceRange[0],
                priceMax: priceRange[1],
                bedrooms,
                bathrooms,
                amenities: selectedAmenities,
                guestCount,
                startDate,
                endDate,
              });
            }}
            className={`px-4 py-2 rounded-full border ${
              selectedCategory === item.category
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {item.title}
          </button>
        ))}
        {/* Button to open modal for additional filters */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 rounded-full bg-indigo-600 text-white"
        >
          <IoFilterSharp className="mr-2" />
          More Filters
        </button>
      </div>

      {/* Modal for Additional Filters */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 text-center">
              Additional Filters
            </Dialog.Title>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  placeholder="Enter city or neighborhood"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price Range (${priceRange[0]} - ${priceRange[1]})
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-1/2 rounded-md border border-gray-300 p-2"
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-1/2 rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={0}>Any</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={0}>Any</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amenities</label>
                <div className="mt-1 space-y-1">
                  {amenitiesList.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Guest Count</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                  <option value={3}>3 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={5}>5+ Guests</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check-in Date</label>
                <input
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check-out Date</label>
                <input
                  type="date"
                  value={endDate || ""}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Reset Filters
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition"
              >
                Apply Filters
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Filters;
