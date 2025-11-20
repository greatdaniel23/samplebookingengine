"use client";

interface PhotoGalleryProps {
  images: string[];
}

export const PhotoGallery = ({ images }: PhotoGalleryProps) => {
  // Use placeholder images if no images are provided
  const defaultImages = [
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2574&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1613977257363-3116958f136b?q=80&w=2670&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop',
  ];
  
  const displayImages = images && images.length > 0 ? images : defaultImages;
  const [firstImage, secondImage, thirdImage, fourthImage, fifthImage] = displayImages;

  return (
    <div>
      {/* Mobile Gallery - Single image carousel */}
      <div className="block md:hidden">
        <div className="relative w-full h-[40vh] rounded-xl overflow-hidden">
          <img 
            src={firstImage || '/placeholder.svg'} 
            alt="Villa" 
            className="w-full h-full object-cover"
            {...{fetchpriority: 'high'}}
          />
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {displayImages.slice(0, 5).map((_, index) => (
                  <div key={index} className="w-2 h-2 rounded-full bg-white/60"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop Gallery - Grid layout */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[55vh] rounded-xl overflow-hidden">
        <div className="col-span-2 row-span-2">
          <img src={firstImage || '/placeholder.svg'} alt="Villa" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" {...{fetchpriority: 'high'}} />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={secondImage || '/placeholder.svg'} alt="Villa" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={thirdImage || '/placeholder.svg'} alt="Villa" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={fourthImage || '/placeholder.svg'} alt="Villa" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={fifthImage || '/placeholder.svg'} alt="Villa" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
        </div>
      </div>
    </div>
  );
};