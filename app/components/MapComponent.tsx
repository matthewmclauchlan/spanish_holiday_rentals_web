'use client';

import React from 'react';

interface MapComponentProps {
  lat: number;
  lng: number;
  zoom?: number;
  height?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ lat, lng, zoom = 15, height = 300 }) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const src = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}&maptype=roadmap`;

  return (
    <div className="px-4 py-4">
      <div className="w-full overflow-hidden rounded-lg" style={{ height: `${height}px` }}>
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          allowFullScreen
          src={src}
        ></iframe>
      </div>
    </div>
  );
};

export default MapComponent;
