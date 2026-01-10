import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { getRoomImagesFromDatabase } from '@/config/images';
import { paths } from '@/config/paths';
import { Room } from '@/types';

interface ImageManagerProps {
  roomId: string;
  onImagesUpdated?: () => void;
}

export const ImageManager: React.FC<ImageManagerProps> = ({ roomId, onImagesUpdated }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableImages, setAvailableImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch room data to get current images
  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      const response = await fetch(paths.buildApiUrl('rooms'));
      const data = await response.json();
      
      if (data.success && data.rooms) {
        const room = data.rooms.find((r: Room) => r.id === roomId);
        setRoomData(room || null);
      }
    } catch (err) {
      console.error('Error fetching room data:', err);
      setError('Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  const roomImages = roomData ? getRoomImagesFromDatabase(roomData.images, roomId) : { main: '', gallery: [], thumbnail: '' };

  const handleRefreshImages = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setAvailableImages([]);
    setSelectedImages([]);
    setShowImagePicker(false);

    console.log('Scanning images for room:', roomId);

    try {
      const apiUrl = paths.buildApiUrl('images/scan');
      console.log('Scanning folder via:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id: roomId })
      });

      console.log('Response status:', response.status);
      const result = await response.json();

      if (result.success) {
        const images = result.availableImages || [];
        setAvailableImages(images);
        
        if (images.length > 0) {
          setShowImagePicker(true);
          setSuccess(`Found ${images.length} image(s). Select which ones to use.`);
        } else {
          setSuccess(`No images found with pattern "${roomId}-*"`);
        }
      } else {
        setError(result.message || 'Failed to scan folder');
        if (result.debug) {
          console.log('Scan debug info:', result.debug);
        }
      }
    } catch (err) {
      console.error('Folder scan error:', err);
      setError(`Failed to scan folder: ${err instanceof Error ? err.message : 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageToggle = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  const handleSaveSelectedImages = async () => {
    if (selectedImages.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = paths.buildApiUrl('images/save');
      console.log('Saving selected images:', selectedImages);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          room_id: roomId,
          selected_images: selectedImages
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Successfully saved ${result.imageCount} image(s) to room`);
        setShowImagePicker(false);
        setAvailableImages([]);
        setSelectedImages([]);
        await fetchRoomData();
        onImagesUpdated?.();
      } else {
        setError(result.message || 'Failed to save images');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(`Failed to save images: ${err instanceof Error ? err.message : 'Network error'}`);
    } finally {
      setSaving(false);
    }
  };

  const ImagePreview: React.FC<{ src: string; title: string; onRemove?: () => void }> = ({
    src,
    title,
    onRemove
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
      <div className="relative group">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-hotel-gold"></div>
            </div>
          )}
          <img
            src={src}
            alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => {
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={(e) => {
              console.warn('Image load failed:', src);
              setImageError(true);
              setImageLoaded(true);
              const target = e.target as HTMLImageElement;
              target.src = '/images/ui/placeholder.svg';
            }}
          />
          {imageError && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
              <div className="text-center text-red-600">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Image not found</p>
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
          {onRemove && (
            <Button
              variant="destructive"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-center mt-2 font-medium">{title}</p>
        {imageError && (
          <p className="text-xs text-red-500 text-center mt-1">Image unavailable</p>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Room Images - {roomId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Folder Images Section */}
        <div className="space-y-4">
          <Label>Manage Room Images from Folder</Label>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefreshImages}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning Folder...' : 'Refresh Images from Folder'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Scans for images in: <code>/images/{roomId}-*.jpg</code>
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Image Picker */}
        {showImagePicker && availableImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Images to Use</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedImages.length} of {availableImages.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (selectedImages.length === availableImages.length) {
                      setSelectedImages([]);
                    } else {
                      setSelectedImages(availableImages.map(img => img.url));
                    }
                  }}
                >
                  {selectedImages.length === availableImages.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
              {availableImages.map((image, index) => {
                const isSelected = selectedImages.includes(image.url);
                return (
                  <div
                    key={image.url}
                    className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-hotel-gold bg-hotel-gold/10' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleImageToggle(image.url)}
                  >
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/ui/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    {/* Selection overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-hotel-gold/20 flex items-center justify-center">
                        <div className="bg-hotel-gold text-white rounded-full p-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Image info */}
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{image.filename}</p>
                      {index === 0 && (
                        <p className="text-xs text-hotel-gold font-medium">Main Image</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {Math.round(image.size / 1024)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveSelectedImages}
                disabled={selectedImages.length === 0 || saving}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : `Save ${selectedImages.length} Selected Image${selectedImages.length !== 1 ? 's' : ''}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowImagePicker(false);
                  setAvailableImages([]);
                  setSelectedImages([]);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Current Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Current Images</Label>
            {roomData?.images && (
              <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                {roomData.images.length} image{roomData.images.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hotel-gold mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading images...</p>
              </div>
            </div>
          ) : roomImages.main || roomImages.gallery.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomImages.main && (
                  <ImagePreview
                    src={roomImages.main}
                    title="Main Image"
                  />
                )}
                {roomImages.gallery.map((imageSrc, index) => (
                  <ImagePreview
                    key={index}
                    src={imageSrc}
                    title={`Gallery ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Debug Info */}
              {process.env.NODE_ENV === 'development' && roomData?.images && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600 font-medium mb-2">Debug Info</summary>
                    <div className="space-y-1 text-gray-500">
                      <p><strong>Total Images:</strong> {roomData.images.length}</p>
                      <p><strong>Main Image:</strong> {roomImages.main}</p>
                      <p><strong>Gallery Count:</strong> {roomImages.gallery.length}</p>
                      <p><strong>Sample URL:</strong> {roomData.images[0]}</p>
                    </div>
                  </details>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No images uploaded yet</p>
              <p className="text-sm">Upload your first image to get started</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Folder-Based Image Management:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Place images in: <code>/images/</code> directory</li>
            <li>• Name files starting with room ID: <code>{roomId}-01.jpg</code></li>
            <li>• Supported formats: JPG, PNG, WebP, GIF</li>
            <li>• Images are sorted alphabetically by filename</li>
            <li>• First image becomes the main room image</li>
            <li>• Click "Refresh" to scan folder and update database</li>
            <li>• Recommended size: 1200x800px (3:2 ratio)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageManager;