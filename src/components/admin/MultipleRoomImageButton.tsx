import React, { useState, useEffect } from 'react';
import { Camera, Plus, X, Star } from 'lucide-react';
import { paths } from '@/config/paths';
import R2ImagePicker from './R2ImagePicker';
import { getImageUrl } from '@/config/r2';

interface RoomImageButtonProps {
  roomId: string | number;
  className?: string;
  onImageSelect?: (images: any[]) => void;
}

const RoomImageButton: React.FC<RoomImageButtonProps> = ({
  roomId,
  className = '',
  onImageSelect
}) => {
  const [roomImages, setRoomImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Fetch current room images on mount
  useEffect(() => {
    if (roomId) {
      fetchRoomImages();
    }
  }, [roomId]);

  const fetchRoomImages = async () => {
    try {
      const response = await fetch(paths.buildApiUrl(`rooms/${roomId}`));
      const data = await response.json();

      if (data.success && data.data && data.data.images) {
        // Ensure images is an array
        let images = data.data.images;
        if (typeof images === 'string') {
          try {
            images = JSON.parse(images);
          } catch (e) {
            images = [];
          }
        }
        // Normalize images
        const normalizedImages = (Array.isArray(images) ? images : []).map(img => {
          if (typeof img === 'string') {
            return { url: getImageUrl(img), filename: img, is_primary: false };
          }
          return {
            ...img,
            url: getImageUrl(img.url || img.filename)
          };
        });
        setRoomImages(normalizedImages);
      } else {
        setRoomImages([]);
      }
    } catch (error) {
      console.error('Error fetching room images:', error);
      setRoomImages([]);
    }
  };

  const updateRoomImages = async (newImages: any[]) => {
    setLoading(true);
    try {
      const response = await fetch(paths.buildApiUrl(`rooms/${roomId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: roomId,
          images: newImages
        })
      });

      const data = await response.json();

      if (data.success) {
        setRoomImages(newImages);
        if (onImageSelect) {
          onImageSelect(newImages);
        }
      } else {
        throw new Error(data.error || 'Failed to update images');
      }
    } catch (error) {
      console.error('Error updating images:', error);
      alert('Error updating images: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (imageId: string) => {
    // R2ImagePicker returns the key/ID. We append it to our list.
    const imageUrl = getImageUrl(imageId);

    const newImageObj = {
      url: imageUrl,
      filename: imageId,
      is_primary: roomImages.length === 0, // First image is primary
      caption: '',
      added_at: new Date().toISOString()
    };

    const newImages = [...roomImages, newImageObj];
    updateRoomImages(newImages);
    setShowPicker(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!confirm('Are you sure you want to remove this image?')) return;
    const newImages = roomImages.filter((_, index) => index !== indexToRemove);
    updateRoomImages(newImages);
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    const newImages = roomImages.map((img, index) => ({
      ...img,
      is_primary: index === indexToPrimary
    }));
    updateRoomImages(newImages);
  };

  return (
    <div className={`room-images-manager ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Room Images ({roomImages.length})
        </span>
        <button
          onClick={() => setShowPicker(true)}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-sm"
        >
          <Plus size={14} />
          <span>Add</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roomImages.map((image, index) => (
          <div key={index} className="relative group border rounded-lg overflow-hidden">
            {/* Handle both string URLs and object structures for backward compatibility */}
            <img
              src={getImageUrl(typeof image === 'string' ? image : (image.url || image.filename))}
              alt="Room"
              className={`w-full h-24 object-cover ${image.is_primary ? 'ring-2 ring-yellow-400' : ''}`}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Img</text></svg>';
              }}
            />

            {image.is_primary && (
              <div className="absolute top-1 left-1 bg-yellow-400 rounded-full p-1 shadow-sm">
                <Star size={12} className="text-white fill-current" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.is_primary && (
                <button
                  onClick={() => handleSetPrimary(index)}
                  className="p-1 bg-yellow-400 rounded text-white hover:bg-yellow-500"
                  title="Set as Primary"
                >
                  <Star size={14} />
                </button>
              )}
              <button
                onClick={() => handleRemoveImage(index)}
                className="p-1 bg-red-500 rounded text-white hover:bg-red-600"
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        {roomImages.length === 0 && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            <Camera className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No images assigned</p>
          </div>
        )}
      </div>

      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            <button
              onClick={() => setShowPicker(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X size={24} />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Select Image from R2 Storage</h3>
              <R2ImagePicker
                onSelect={(imageId) => handleImageSelect(imageId)}
                prefix=""
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomImageButton;