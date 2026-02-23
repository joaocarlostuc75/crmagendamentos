import React from 'react';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  watermarkText: string;
}

const WatermarkedImage: React.FC<WatermarkedImageProps> = ({ src, alt, watermarkText }) => {
  return (
    <div className="relative inline-block">
      <img src={src} alt={alt} className="block w-full h-auto" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-white text-2xl font-bold bg-black bg-opacity-50 px-4 py-2 rounded"
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
        >
          {watermarkText}
        </span>
      </div>
    </div>
  );
};

export default WatermarkedImage;
