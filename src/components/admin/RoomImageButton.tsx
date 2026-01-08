import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

interface RoomImageButtonProps {
  roomId: string | number;
  className?: string;
  onImageSelect?: (imageData: RoomImageData) => void;
}

interface RoomImageData {
  image_path: string;
  image_folder: string;
  image_url: string;
}

const RoomImageButton: React.FC<RoomImageButtonProps> = ({ 
  roomId, 
  className = '', 
  onImageSelect 
}) => {
  const [currentImage, setCurrentImage] = useState<RoomImageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch current room image on mount
  useEffect(() => {
    if (roomId) {
      fetchRoomImage();
    }
  }, [roomId]);

  const fetchRoomImage = async () => {
    try {
      // Use confirmed working rooms API to get room data with images
      const response = await fetch(`https://api.rumahdaisycantik.com/rooms.php?id=${roomId}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.images && data.data.images.length > 0) {
        // Use first image from processed room images
        const firstImage = data.data.images[0];
        setCurrentImage({
          image_path: firstImage.filename,
          image_folder: firstImage.folder || data.data.image_folder,
          image_url: firstImage.url
        });
      }
    } catch (error) {
      console.error('Error fetching room image:', error);
    }
  };

  const handleImageSelection = async (imagePath: string, imageFolder: string) => {
    setLoading(true);
    
    try {
      // Update room with selected image using confirmed rooms API
      const response = await fetch('https://api.rumahdaisycantik.com/rooms.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: roomId,
          images: [imagePath] // Set the selected image as the room's image array
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Build the correct image URL using confirmed structure
        const imageUrl = `https://rumahdaisycantik.com/images/rooms/${imageFolder}/${imagePath}`;
        
        const imageData: RoomImageData = {
          image_path: imagePath,
          image_folder: imageFolder,
          image_url: imageUrl
        };
        
        setCurrentImage(imageData);
        setShowModal(false);
        
        // Notify parent component
        if (onImageSelect) {
          onImageSelect(imageData);
        }
      } else {
        throw new Error(data.error || 'Failed to assign image');
      }
    } catch (error) {
      console.error('Error assigning image:', error);
      alert('Error assigning image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImage || !confirm('Are you sure you want to remove this image?')) {
      return;
    }

    setLoading(true);
    
    try {
      // Update room to remove images using rooms API
      const response = await fetch(`https://api.rumahdaisycantik.com/rooms.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roomId,
          images: [] // Clear images array
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentImage(null);
        
        // Notify parent component
        if (onImageSelect) {
          onImageSelect(null as any);
        }
      } else {
        throw new Error(data.error || 'Failed to remove image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Error removing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`room-image-button ${className}`}>
        {currentImage ? (
          // Display current image with options to change/remove
          <div className="flex flex-col gap-2">
            <div className="relative inline-block group">
              <img 
                src={currentImage.image_url} 
                alt="Room image"
                className="w-20 h-20 object-cover rounded-lg border-2 border-[var(--hotel-gold)]"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,' + encodeURIComponent(`
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="80" height="80" fill="#F5F2E8"/>
                      <path d="M20 20H60V60H20V20Z" stroke="#E6A500" stroke-width="2" fill="none"/>
                      <circle cx="30" cy="30" r="4" fill="#E6A500"/>
                      <path d="M20 50L30 40L40 45L50 35L60 45V60H20V50Z" fill="#E6A500" opacity="0.5"/>
                    </svg>
                  `);
                }}
              />
              <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={loading}
                  className="w-6 h-6 rounded-full border-0 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 bg-[var(--hotel-gold)] text-white hover:bg-[var(--hotel-bronze)]"
                  title="Change image"
                >
                  <Camera size={16} />
                </button>
                <button
                  onClick={handleRemoveImage}
                  disabled={loading}
                  className="w-6 h-6 rounded-full border-0 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 bg-red-500 text-white font-bold hover:bg-red-600"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            </div>
            <div>
              <small className="text-[var(--hotel-sage)] text-xs">
                {currentImage.image_folder}/{currentImage.image_path.split('/').pop()}
              </small>
            </div>
          </div>
        ) : (
          // No image assigned - show add button
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[var(--hotel-gold)] rounded-lg text-[var(--hotel-gold)] hover:bg-[var(--hotel-gold)] hover:text-white transition-colors duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Camera size={20} />
            <span>{loading ? 'Loading...' : 'Add Image'}</span>
          </button>
        )}
      </div>

      {/* Image Gallery Modal */}
      {showModal && (
        <ImageGalleryModal
          roomId={roomId}
          onImageSelect={handleImageSelection}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

// Image Gallery Modal Component
interface ImageGalleryModalProps {
  roomId: string | number;
  onImageSelect: (imagePath: string, imageFolder: string) => void;
  onClose: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  roomId,
  onImageSelect,
  onClose
}) => {
  const [selectedFolder, setSelectedFolder] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load available folders on mount
  useEffect(() => {
    loadAvailableFolders();
  }, []);

  // Load images when folder changes
  useEffect(() => {
    if (selectedFolder) {
      loadFolderImages(selectedFolder);
    }
  }, [selectedFolder]);

  const loadAvailableFolders = async () => {
    setLoadingFolders(true);
    try {
      // Use confirmed working API endpoint
      const response = await fetch(`https://api.rumahdaisycantik.com/image-scanner.php?action=folders&basePath=../images/rooms`);
      const data = await response.json();
      
      if (data.success && data.folders) {
        // Filter out 'upload' folder for room selection
        const roomFolders = data.folders.filter((folder: string) => folder !== 'upload');
        setFolders(roomFolders);
        // Set first folder as default
        if (roomFolders.length > 0 && !selectedFolder) {
          setSelectedFolder(roomFolders[0]);
        }
      } else {
        // Fallback folders based on what we know exists
        const fallbackFolders = ['Villa1', 'Villa2', 'Villa3', 'Villa4', 'Villa5', 'Villa6'];
        setFolders(fallbackFolders);
        setSelectedFolder(fallbackFolders[0]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      // Fallback folders based on confirmed structure
      const fallbackFolders = ['Villa1', 'Villa2', 'Villa3', 'Villa4', 'Villa5', 'Villa6'];
      setFolders(fallbackFolders);
      setSelectedFolder(fallbackFolders[0]);
    } finally {
      setLoadingFolders(false);
    }
  };

  const loadFolderImages = async (folder: string) => {
    setLoading(true);
    try {
      // Use confirmed working API endpoint
      const response = await fetch(`https://api.rumahdaisycantik.com/image-scanner.php?folder=${folder}&basePath=../images/rooms`);
      const data = await response.json();
      
      if (data.success && data.images) {
        setImages(data.images);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imagePath: string) => {
    setSelectedImage(imagePath);
  };

  const handleUseImage = () => {
    if (selectedImage) {
      onImageSelect(selectedImage, selectedFolder);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full m-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-[var(--hotel-navy)]">
            Select Room Image
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Folder Selector */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[var(--hotel-navy)]">
              Select Folder:
            </label>
            {loadingFolders ? (
              <div className="text-sm text-[var(--hotel-sage)]">Loading folders...</div>
            ) : (
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="px-3 py-2 border border-[var(--hotel-gold)] rounded-lg text-[var(--hotel-navy)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--hotel-gold)] focus:border-transparent min-w-[150px]"
              >
                {folders.length === 0 ? (
                  <option value="">No folders found</option>
                ) : (
                  folders.map(folder => (
                    <option key={folder} value={folder}>
                      {folder} folder
                    </option>
                  ))
                )}
              </select>
            )}
            {folders.length > 0 && (
              <span className="text-xs text-[var(--hotel-sage)]">
                {folders.length} folder{folders.length !== 1 ? 's' : ''} available
              </span>
            )}
          </div>
        </div>

        {/* Image Gallery Grid - Professional Style */}
        <div className="flex-1 p-4 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-[var(--hotel-sage)]">Loading images...</div>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer ${
                    selectedImage === image
                      ? 'ring-4 ring-[var(--hotel-gold)] ring-opacity-50 transform scale-[1.02]'
                      : 'hover:shadow-lg hover:transform hover:scale-[1.02]'
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <div className="relative">
                    <img
                      src={`https://rumahdaisycantik.com/images/rooms/${selectedFolder}/${image}`}
                      alt={image}
                      className="w-full h-40 object-cover"
                      onLoad={(e) => {
                        console.log(`✅ Image loaded: ${selectedFolder}/${image}`);
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.log(`❌ Image failed from main domain: ${target.src}`);
                        
                        // Show elegant placeholder
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.image-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'image-placeholder w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 text-center p-2';
                          placeholder.innerHTML = `
                            <div class="text-3xl mb-2">📷</div>
                            <div class="text-sm font-medium text-gray-600 truncate px-2">${image}</div>
                            <div class="text-xs mt-1 text-gray-500">${selectedFolder} folder</div>
                            <div class="text-xs mt-1 opacity-70">Preview not available</div>
                          `;
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                    
                    {/* Selection Indicator */}
                    {selectedImage === image && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-[var(--hotel-gold)] text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Info Card */}
                  <div className="p-4">
                    <div className="font-semibold text-[var(--hotel-navy)] text-sm mb-1 truncate" title={image}>
                      {image}
                    </div>
                    <div className="text-xs text-[var(--hotel-sage)] mb-2">
                      📁 {selectedFolder} folder
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-[var(--hotel-cream)] text-[var(--hotel-bronze)] px-2 py-1 rounded-full">
                        .{image.split('.').pop()?.toUpperCase()}
                      </span>
                      {selectedImage === image && (
                        <span className="text-xs text-[var(--hotel-gold)] font-semibold">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="mb-4">No images found in {selectedFolder} folder</div>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                <p><strong>Note:</strong> To use this feature, upload images to:</p>
                <p className="font-mono">public/images/{selectedFolder}/</p>
                <p className="mt-2">Supported folders: hero, packages, amenities, ui, uploads</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-[var(--hotel-sage)]">
            {selectedImage ? `Selected: ${selectedImage}` : 'Click an image to select'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUseImage}
              disabled={!selectedImage}
              className="px-6 py-2 bg-[var(--hotel-gold)] text-white rounded-lg hover:bg-[var(--hotel-bronze)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use This Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomImageButton;