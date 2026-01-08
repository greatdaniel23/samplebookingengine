import React, { useEffect } from 'react';
import ImageGallery from '@/components/ImageGallery';

const ImageGalleryPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Image Gallery - Villa Booking Engine';
  }, []);

  return <ImageGallery />;
};

export default ImageGalleryPage;