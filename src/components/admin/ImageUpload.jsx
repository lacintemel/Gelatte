import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ images, setImages }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages(prev => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-cream-dark/25 group bg-champagne">
            <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-espresso/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-espresso text-cream text-[10px] uppercase tracking-wider px-2 py-1 rounded-md">
                Primary
              </div>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square rounded-xl border-2 border-dashed border-cream-dark/50 bg-champagne hover:bg-cream/50 transition-colors flex flex-col items-center justify-center text-warm-gray gap-2"
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs font-medium uppercase tracking-wider">Upload</span>
        </button>
      </div>
      
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <p className="text-xs text-warm-gray">Upload up to 4 images. The first image will be used as the primary product image.</p>
    </div>
  );
}
