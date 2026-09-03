"use client";

import { useState } from "react";
import Image from "next/image";

interface ListingPhotoGalleryProps {
  photos: string[];
  title: string;
}

export function ListingPhotoGallery({ photos, title }: ListingPhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const hasPhotos = photos.length > 0;

  if (!hasPhotos) {
    return (
      <div className="h-[40vh] sm:h-[500px] md:h-[60vh] min-h-[300px] rounded-2xl overflow-hidden group border border-border bg-slate-100 flex items-center justify-center text-slate-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-24 h-24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      </div>
    );
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <>
      {/* Mobile Slider View */}
      <div className="sm:hidden relative w-full h-[300px] rounded-2xl overflow-hidden group">
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full w-full">
          {photos.map((photo: string, i: number) => (
            <div 
              key={i} 
              className="flex-none w-full h-full snap-center relative cursor-pointer"
              onClick={() => setSelectedIndex(i)}
            >
              <Image
                src={photo}
                alt={`${title} - Image ${i + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 pointer-events-none bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md tracking-wider">
            1 of {photos.length} • Swipe
          </div>
        )}
      </div>

      {/* Desktop Grid View */}
      <div className={`hidden sm:grid relative gap-2 h-[400px] sm:h-[500px] md:h-[60vh] min-h-[400px] rounded-2xl overflow-hidden group ${
        photos.length === 1 ? 'grid-cols-1 grid-rows-1' :
        photos.length === 2 ? 'grid-cols-2 grid-rows-1' :
        photos.length === 3 ? 'grid-cols-3 grid-rows-2' :
        photos.length === 4 ? 'grid-cols-2 grid-rows-2' :
        'grid-cols-4 grid-rows-2'
      }`}>
        {photos.length > 0 && (
          <div 
            className={`relative cursor-pointer ${
              photos.length === 1 ? 'col-span-1 row-span-1' :
              photos.length === 2 ? 'col-span-1 row-span-1' :
              photos.length === 3 ? 'col-span-2 row-span-2' :
              photos.length === 4 ? 'col-span-1 row-span-1' :
              'col-span-2 row-span-2'
            }`}
            onClick={() => setSelectedIndex(0)}
          >
            <Image
              src={photos[0]}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover hover:opacity-90 transition"
            />
          </div>
        )}
        {photos.length > 1 && (
          <div className="col-span-1 row-span-1 relative cursor-pointer" onClick={() => setSelectedIndex(1)}>
            <Image src={photos[1]} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover hover:opacity-90 transition" />
          </div>
        )}
        {photos.length > 2 && (
          <div className="col-span-1 row-span-1 relative cursor-pointer" onClick={() => setSelectedIndex(2)}>
            <Image src={photos[2]} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover hover:opacity-90 transition" />
          </div>
        )}
        {photos.length > 3 && (
          <div className="col-span-1 row-span-1 relative cursor-pointer" onClick={() => setSelectedIndex(3)}>
            <Image src={photos[3]} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover hover:opacity-90 transition" />
          </div>
        )}
        {photos.length > 4 && (
          <div className="col-span-1 row-span-1 relative cursor-pointer" onClick={() => setSelectedIndex(4)}>
            <Image src={photos[4]} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover hover:opacity-90 transition" />
            {photos.length > 5 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(0); }}
                className="absolute bottom-4 right-4 bg-card border border-heading px-4 py-1.5 rounded-lg text-sm font-semibold text-heading shadow-md hover:bg-slate-50 transition flex items-center gap-2"
              >
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', height: '12px', width: '12px', fill: 'currentColor' }}><path d="M14.33 2.67h-3V1.33h3c.74 0 1.34.6 1.34 1.34v3h-1.34v-3zM2.67 2.67v3H1.33v-3c0-.74.6-1.34 1.34-1.34h3v1.34h-3zm11.66 10.66v-3h1.34v3c0 .74-.6 1.34-1.34 1.34h-3v-1.34h3zm-11.66 0h3v1.34h-3c-.74 0-1.34-.6-1.34-1.34v-3h1.34v3z"></path></svg>
                Show all photos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
            <button 
              onClick={() => setSelectedIndex(null)}
              className="text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
            <div className="text-white/70 bg-black/50 rounded-full px-4 py-2 font-medium tracking-wide text-sm">
              {selectedIndex + 1} / {photos.length}
            </div>
          </div>

          <div 
            className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()} // Prevent clicks on image from closing modal
          >
            <Image
              src={photos[selectedIndex]}
              alt={`${title} - Full Image`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {photos.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
