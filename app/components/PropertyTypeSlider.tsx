'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { PropertyType } from '../lib/PropertyTypes';

interface PropertyTypeSliderProps {
  types: PropertyType[];
  selectedType: string;
  onSelect: (type: string) => void;
}

const PropertyTypeSlider: React.FC<PropertyTypeSliderProps> = ({ types, selectedType, onSelect }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(false);

  const checkChevrons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftChevron(scrollLeft > 0);
      setShowRightChevron(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    checkChevrons();
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener('scroll', checkChevrons);
    window.addEventListener('resize', checkChevrons);

    return () => {
      slider.removeEventListener('scroll', checkChevrons);
      window.removeEventListener('resize', checkChevrons);
    };
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {showLeftChevron && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-200"
        >
          <FiChevronLeft size={24} className="text-gray-600" />
        </button>
      )}
      {showRightChevron && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-200"
        >
          <FiChevronRight size={24} className="text-gray-600" />
        </button>
      )}
      <div
        ref={sliderRef}
        className="flex space-x-4 overflow-x-auto py-4 px-10 scrollbar-hide"
      >
        {types.map((item) => (
          <div key={item.type} className="flex flex-col items-center min-w-[4rem]">
            <button
              onClick={() => onSelect(item.type)}
              className={`flex items-center justify-center w-16 h-16 rounded-full border transition-colors ${
                selectedType === item.type
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={32}
                height={32}
                className="object-contain"
              />
            </button>
            <span className="mt-2 text-sm text-gray-700 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyTypeSlider;
