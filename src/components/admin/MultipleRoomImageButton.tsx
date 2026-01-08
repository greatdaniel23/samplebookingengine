import React, { useState, useEffect } from 'react';
import { Camera, Plus, X, Star } from 'lucide-react';

interface RoomImageButtonProps {
  roomId: string | number;
  className?: string;
  onImageSelect?: (images: RoomImageData[]) => void;
}

interface RoomImageData {
  filename: string;
  folder: string;
  url: string;
  is_primary?: boolean;
  caption?: string;
  added_at?: string;
}

const RoomImageButton: React.FC<RoomImageButtonProps> = ({ 
  roomId, 
  className = '', 
  onImageSelect 
}) => {
  const [roomImages, setRoomImages] = useState<RoomImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);

  // Fetch current room images on mount
  useEffect(() => {
    if (roomId) {
      fetchRoomImages();
    }
  }, [roomId]);

  const fetchRoomImages = async () => {
    try {
      // Use confirmed working rooms API to get room data with images
      const response = await fetch(`https://api.rumahdaisycantik.com/rooms.php?id=${roomId}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.images) {
        setRoomImages(data.data.images || []);
      } else {
        setRoomImages([]);
      }
    } catch (error) {
      console.error('Error fetching room images:', error);
      setRoomImages([]);
    }
  };

  const loadAvailableFolders = async () => {
    try {
      // Use confirmed working image scanner API
      const response = await fetch('https://api.rumahdaisycantik.com/image-scanner.php?action=folders&basePath=../images/rooms');
      const data = await response.json();
      
      if (data.success && data.folders) {
        setAvailableFolders(data.folders);
      }
    } catch (error) {
      console.error('Error loading available folders:', error);
    }
  };

  const handleAddImage = async (filename: string, folder: string, caption: string = '') => {
    console.log('handleAddImage called:', { roomId, filename, folder, caption });
    setLoading(true);
    
    try {
      const requestBody = {
        id: roomId,
        action: 'add_image',
        image_data: {
          filename,
          folder,
          caption,
          added_by: 'admin'
        }
      };
      console.log('API request:', requestBody);
      
      // Add new image to room using rooms API
      const response = await fetch('https://api.rumahdaisycantik.com/rooms.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API response:', data);
      
      if (data.success && data.data.images) {
        setRoomImages(data.data.images);
        console.log('Image added successfully!');
        
        // Notify parent component
        if (onImageSelect) {
          onImageSelect(data.data.images);
        }
      } else {
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to add image');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Error adding image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (filename: string) => {
    if (!confirm('Are you sure you want to remove this image?')) {
      return;
    }

    setLoading(true);
    
    try {
      // Remove image from room using rooms API
      const response = await fetch(`https://api.rumahdaisycantik.com/rooms.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roomId,
          action: 'remove_image',
          filename
        })
      });

      const data = await response.json();
      
      if (data.success && data.data.images !== undefined) {
        setRoomImages(data.data.images);
        
        // Notify parent component
        if (onImageSelect) {
          onImageSelect(data.data.images);
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

  const handleSetPrimaryImage = async (filename: string) => {
    setLoading(true);
    
    try {
      // Set primary image using rooms API
      const response = await fetch(`https://api.rumahdaisycantik.com/rooms.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roomId,
          action: 'set_primary_image',
          filename
        })
      });

      const data = await response.json();
      
      if (data.success && data.data.images) {
        setRoomImages(data.data.images);
        
        // Notify parent component
        if (onImageSelect) {
          onImageSelect(data.data.images);
        }
      } else {
        throw new Error(data.error || 'Failed to set primary image');
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Error setting primary image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = () => {
    return roomImages.find(img => img.is_primary) || roomImages[0] || null;
  };

  return (
    <>
      <div className={`room-images-manager ${className}`}>
        <div className="images-header flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--hotel-sage)]">
            Room Images ({roomImages.length})
          </span>
          <button
            onClick={() => {
              loadAvailableFolders();
              setShowModal(true);
            }}
            disabled={loading}
            className="add-image-btn flex items-center gap-1 px-3 py-1 border border-[var(--hotel-gold)] rounded-md text-[var(--hotel-gold)] hover:bg-[var(--hotel-gold)] hover:text-white transition-colors duration-200 text-sm"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>

        <div className="images-grid">
          {roomImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {roomImages.map((image, index) => (
                <div key={`${image.filename}-${index}`} className="image-item relative group">
                  <div className="relative">
                    <img 
                      src={image.url} 
                      alt={image.caption || `Room image ${index + 1}`}
                      className={`w-full h-16 object-cover rounded-lg border-2 ${
                        image.is_primary 
                          ? 'border-[var(--hotel-gold)] ring-2 ring-[var(--hotel-gold)] ring-opacity-50' 
                          : 'border-gray-200'
                      }`}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,' + encodeURIComponent(`
                          <svg width="80" height="64" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="80" height="64" fill="#F5F2E8"/>
                            <path d="M10 10H70V54H10V10Z" stroke="#E6A500" stroke-width="2" fill="none"/>
                            <circle cx="20" cy="20" r="3" fill="#E6A500"/>
                            <path d="M10 44L20 34L30 39L40 29L50 39V54H10V44Z" fill="#E6A500" opacity="0.5"/>
                          </svg>
                        `);
                      }}
                    />
                    
                    {/* Primary indicator */}
                    {image.is_primary && (
                      <div className="absolute top-1 left-1">
                        <Star size={12} className="text-[var(--hotel-gold)] fill-current" />
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-1">
                      {!image.is_primary && (
                        <button
                          onClick={() => handleSetPrimaryImage(image.filename)}
                          disabled={loading}
                          className="p-1 bg-[var(--hotel-gold)] text-white rounded hover:bg-opacity-80 transition-colors"
                          title="Set as primary"
                        >
                          <Star size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveImage(image.filename)}
                        disabled={loading}
                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Image info */}
                  <div className="text-xs text-gray-500 mt-1 truncate" title={image.filename}>
                    {image.filename.split('/').pop()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No images assigned - show add button
            <div className="empty-state flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Camera size={32} className="text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm mb-3">No images assigned to this room</p>
              <button
                onClick={() => {
                  loadAvailableFolders();
                  setShowModal(true);
                }}
                disabled={loading}
                className="add-image-btn flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[var(--hotel-gold)] rounded-lg text-[var(--hotel-gold)] hover:bg-[var(--hotel-gold)] hover:text-white transition-colors duration-200"
              >
                <Plus size={16} />
                <span>{loading ? 'Loading...' : 'Add First Image'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showModal && (
        <MultipleImageGalleryModal
          availableFolders={availableFolders}
          onImageSelect={handleAddImage}
          onClose={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </>
  );
};

// Updated Modal Component for Multiple Images
interface MultipleImageGalleryModalProps {
  availableFolders: string[];
  onImageSelect: (filename: string, folder: string, caption?: string) => void;
  onClose: () => void;
  loading: boolean;
}

const MultipleImageGalleryModal: React.FC<MultipleImageGalleryModalProps> = ({
  availableFolders,
  onImageSelect,
  onClose,
  loading
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [folderImages, setFolderImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageCaption, setImageCaption] = useState<string>('');
  
  useEffect(() => {
    if (selectedFolder) {
      loadFolderImages(selectedFolder);
    }
  }, [selectedFolder]);

  // Auto-select first folder when availableFolders arrive
  useEffect(() => {
    if (!selectedFolder && Array.isArray(availableFolders) && availableFolders.length > 0) {
      setSelectedFolder(availableFolders[0]);
    }
  }, [availableFolders, selectedFolder]);

  const loadFolderImages = async (folder: string) => {
    setLoadingImages(true);
    try {
      // Use confirmed working rooms API to get folder images
      const response = await fetch(`https://api.rumahdaisycantik.com/rooms.php?images=${folder}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.images) {
        setFolderImages(data.data.images.map((img: any) => img.filename));
      } else {
        setFolderImages([]);
      }
    } catch (error) {
      console.error('Error loading folder images:', error);
      setFolderImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleImageClick = (filename: string) => {
    console.log('Image clicked:', { filename, selectedFolder, imageCaption });
    if (!selectedFolder) {
      alert('Please select a folder first');
      return;
    }
    onImageSelect(filename, selectedFolder, imageCaption);
    setImageCaption('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--hotel-sage)]">Add Room Image</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image Folder
              </label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--hotel-gold)] focus:border-transparent"
              >
                <option value="">Choose a folder...</option>
                {availableFolders.map(folder => (
                  <option key={folder} value={folder}>
                    {folder} 
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Caption (Optional)
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="Enter a caption for this image..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--hotel-gold)] focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedFolder ? (
            loadingImages ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-gray-500">Loading images from {selectedFolder}...</p>
              </div>
            ) : folderImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {folderImages.map(filename => (
                  <div 
                    key={filename} 
                    className="image-option cursor-pointer group"
                    onClick={() => {
                      console.log('Image clicked:', filename);
                      handleImageClick(filename);
                    }}
                  >
                    <div className="relative">
                      <img
                        src={`https://rumahdaisycantik.com/images/rooms/${selectedFolder}/${filename}`}
                        alt={filename}
                        className="w-full h-32 object-cover rounded-lg border-2 border-transparent group-hover:border-[var(--hotel-gold)] transition-all duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,' + encodeURIComponent(`
                            <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect width="128" height="128" fill="#F5F2E8"/>
                              <path d="M20 20H108V108H20V20Z" stroke="#E6A500" stroke-width="2" fill="none"/>
                              <circle cx="40" cy="40" r="8" fill="#E6A500"/>
                              <path d="M20 88L40 68L60 78L80 58L108 78V108H20V88Z" fill="#E6A500" opacity="0.5"/>
                              <text x="64" y="70" text-anchor="middle" fill="#E6A500" font-size="12">Image Not Found</text>
                            </svg>
                          `);
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none">
                        <Plus 
                          size={24} 
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate" title={filename}>
                      {filename}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No images found in {selectedFolder}</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <Camera size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Select a folder to browse images</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomImageButton;