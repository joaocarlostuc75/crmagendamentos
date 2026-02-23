import React from 'react';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  watermarkText?: string;
  className?: string;
  alt?: string;
}

export default function WatermarkedImage({ src, watermarkText, className = '', alt = '', ...props }: WatermarkedImageProps) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      {...props} 
    />
  );
}
