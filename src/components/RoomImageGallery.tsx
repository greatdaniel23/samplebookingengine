import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface RoomImageGalleryProps {
  roomId: string | number;
  roomName: string;
  className?: string;
  fallbackStrategy?: 'room_type' | 'package_type' | 'placeholder';
  roomType?: string;
}

interface RoomImage {
  filename: string;
  folder: string;
  url: string;
  is_primary?: boolean;
  caption?: string;
}

const RoomImageGallery: React.FC<RoomImageGalleryProps> = ({ 
  roomId, 
  roomName, 
  className = '',
  fallbackStrategy,
  roomType
}) => {
  const [images, setImages] = useState<RoomImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchRoomImages();
  }, [roomId]);

  const buildImageUrl = (folder: string, filename: string) => {
    // Use R2 storage URL or relative path
    return `/images/rooms/${folder}/${filename}`;
  };

  const normalizeRoomTypeToFolder = (type?: string) => {
    if (!type) return '';
    // e.g., "Villa 1" -> "Villa1"
    const trimmed = type.trim();
    const compact = trimmed.replace(/\s+/g, '');
    // Ensure it starts with VillaX pattern; if not, return as-is compacted
    return compact;
  };

  const fetchFirstImageFromFolder = async (folder: string): Promise<RoomImage[] | null> => {
    try {
      const resp = await fetch(`https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/rooms/images/${encodeURIComponent(folder)}`);
      const json = await resp.json();
      if (json && json.success && json.data && Array.isArray(json.data.images) && json.data.images.length > 0) {
        // Use first image as fallback
        const first = json.data.images[0];
        const filename = first.filename || first; // API returns objects with filename
        const url = buildImageUrl(folder, filename);
        return [{ filename, folder, url, is_primary: true, caption: `${roomName}` }];
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const applyFallbackIfNeeded = async () => {
    // Try room_type fallback first if requested
    if (fallbackStrategy === 'room_type' && roomType) {
      const folder = normalizeRoomTypeToFolder(roomType);
      if (folder) {
        const fallbackImages = await fetchFirstImageFromFolder(folder);
        if (fallbackImages && fallbackImages.length > 0) {
          setImages(fallbackImages);
          setCurrentImageIndex(0);
          setImageError(false);
          return;
        }
      }
    }

    // Placeholder fallback
    if (fallbackStrategy === 'placeholder' || !fallbackStrategy) {
      setImages([]);
      setImageError(true);
      return;
    }

    // Default: show error
    setImages([]);
    setImageError(true);
  };

  const fetchRoomImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://booking-engine-api.danielsantosomarketing2017.workers.dev/api/rooms/${roomId}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.images && data.data.images.length > 0) {
        // Sort images so primary image is first
        const sortedImages = [...data.data.images].sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return 0;
        });
        
        setImages(sortedImages);
        setCurrentImageIndex(0);
        setImageError(false);
      } else {
        await applyFallbackIfNeeded();
        return;
      }
    } catch (error) {
      console.error('Error fetching room images:', error);
      await applyFallbackIfNeeded();
      return;
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <div className={`room-image-gallery ${className}`}>
        <div className="w-full h-24 bg-gray-200 rounded animate-pulse flex items-center justify-center">
          <span className="text-gray-400 text-sm">Loading images...</span>
        </div>
      </div>
    );
  }

  if (imageError || images.length === 0) {
    return (
      <div className={`room-image-gallery ${className}`}>
        <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-500 text-xs">📷</span>
            </div>
            <span className="text-gray-400 text-xs">No images available</span>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className={`room-image-gallery relative ${className}`}>
      {/* Main Image Display */}
      <div className="relative w-full h-24 rounded overflow-hidden bg-gray-100">
        <img
          src={currentImage.url}
          alt={currentImage.caption || `${roomName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={handleImageError}
        />
        
        {/* Primary Image Indicator */}
        {currentImage.is_primary && (
          <div className="absolute top-2 left-2">
            <Star size={12} className="text-yellow-400 fill-current drop-shadow-sm" />
          </div>
        )}
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all p-1 rounded"
              aria-label="Previous image"
            >
              <ChevronLeft size={14} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all p-1 rounded"
              aria-label="Next image"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image.filename}-${index}`}
              onClick={(e) => {
                e.stopPropagation();
                goToImage(index);
              }}
              className={`flex-shrink-0 w-8 h-6 rounded overflow-hidden border transition-all ${
                index === currentImageIndex 
                  ? 'border-blue-500 ring-1 ring-blue-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img
                src={image.url}
                alt={`${roomName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={() => {}} // Don't handle errors for thumbnails to avoid layout shifts
              />
              {image.is_primary && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star size={8} className="text-yellow-400 fill-current drop-shadow" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Image Caption */}
      {currentImage.caption && (
        <div className="mt-1">
          <p className="text-xs text-gray-600 truncate" title={currentImage.caption}>
            {currentImage.caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomImageGallery;