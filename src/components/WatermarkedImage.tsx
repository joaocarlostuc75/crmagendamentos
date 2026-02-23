import React, { useEffect, useRef, useState } from 'react';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  watermarkText?: string;
  className?: string;
  alt?: string;
}

export default function WatermarkedImage({ src, watermarkText = 'Beauty Agenda', className = '', alt = '', ...props }: WatermarkedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for external images
    img.src = src;

    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Configure watermark text
      const fontSize = Math.max(20, img.width * 0.05); // Responsive font size
      ctx.font = `bold ${fontSize}px "Playfair Display", serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Rotate and draw text pattern
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(watermarkText, 0, 0);
      ctx.restore();

      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error("Failed to load image for watermarking:", src);
      // Fallback or error handling could go here
    };

  }, [src, watermarkText]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover"
        title={alt}
        {...props as any}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <span className="sr-only">Carregando imagem...</span>
        </div>
      )}
    </div>
  );
}
