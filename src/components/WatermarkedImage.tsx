import React from 'react';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  watermarkText?: string;
  className?: string;
  alt?: string;
}

export default function WatermarkedImage({ src, watermarkText = 'Beauty Agenda', className = '', alt = '', ...props }: WatermarkedImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" {...props} />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 select-none overflow-hidden mix-blend-overlay">
        <div className="transform -rotate-45 text-white font-display font-bold text-center leading-tight" style={{ fontSize: '1.5rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {watermarkText}
        </div>
      </div>
    </div>
  );
}
