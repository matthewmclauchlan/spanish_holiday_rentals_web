'use client';

import React from 'react';
import Image from 'next/image';

interface ImageSliderProps {
  images: string[];
  height?: number;
}

const DEFAULT_HEIGHT = 300;

const ImageSlider: React.FC<ImageSliderProps> = ({ images, height = DEFAULT_HEIGHT }) => {
  // Use the first image as the main image, next 4 for the grid tiles.
  const mainImage = images[0];
  const gridImages = images.slice(1, 5);
  const extraCount = images.length - 5;

  return (
    <div className="px-4 py-4">
      <div className="w-full overflow-hidden rounded-lg" style={{ height: `${height}px` }}>
        <div className="flex h-full gap-1">
          {/* Main Image */}
          <div className="relative w-1/2 h-full">
            {mainImage && (
              <Image
                src={mainImage}
                alt="Property Image 1"
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Grid of 4 smaller images */}
          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-1/2 h-full">
            {gridImages.map((img, index) => (
              <div key={index} className="relative">
                <Image
                  src={img}
                  alt={`Property Image ${index + 2}`}
                  fill
                  className="object-cover"
                />
                {index === gridImages.length - 1 && extraCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <button className="text-white text-lg font-bold">
                      View {extraCount} More
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
