"use client";

interface PhotoGalleryProps {
  images: string[];
}

export const PhotoGallery = ({ images }: PhotoGalleryProps) => {
  if (!images || images.length === 0) {
    return null;
  }

  const [firstImage, secondImage, thirdImage, fourthImage, fifthImage] = images;

  return (
    <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[55vh] rounded-xl overflow-hidden">
      <div className="col-span-2 row-span-2">
        <img src={firstImage || '/placeholder.svg'} alt="Villa" className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" />
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
  );
};