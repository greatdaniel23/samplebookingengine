import React, { useState, useEffect } from 'react';
import { paths } from '@/config/paths';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface R2ImagePickerProps {
  onSelect: (imageId: string) => void;
  currentImage?: string;
  prefix?: string;
}

const R2ImagePicker: React.FC<R2ImagePickerProps> = ({
  onSelect,
  currentImage,
  prefix = ''
}) => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(currentImage || '');
  const [dragActive, setDragActive] = useState(false);

  const R2_PUBLIC_URL = 'https://alphadigitalagency.id';
  const API_BASE_URL = paths.apiBase;

  console.log('R2ImagePicker - API_BASE_URL:', API_BASE_URL);

  useEffect(() => {
    if (showModal) {
      loadImages();
    }
  }, [showModal]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const url = prefix ? `${API_BASE_URL}/images/list?prefix=${prefix}` : `${API_BASE_URL}/images/list`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Loaded images:', data);

      if (data.success) {
        const files = data.data.files || [];
        console.log('Images array:', files);
        setImages(files);
      }
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate all files before uploading
    const fileArray = Array.from(files);
    const invalidFiles = fileArray.filter(file => {
      if (file.size > 10 * 1024 * 1024) return true;
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'].includes(file.type)) return true;
      return false;
    });

    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} file(s) are invalid. Files must be less than 10MB and be JPEG, PNG, WebP, AVIF, or GIF.`);
      return;
    }

    setUploading(true);
    const uploadedIds: string[] = [];
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    try {
      // Limit to 50 files max to avoid overwhelming
      if (fileArray.length > 50) {
        alert('Maximum 50 files allowed per upload. Please upload in batches.');
        setUploading(false);
        return;
      }

      // Upload files sequentially to avoid overwhelming the API
      for (const file of fileArray) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('prefix', prefix);

          const response = await fetch(`${API_BASE_URL}/images/upload`, {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            uploadedIds.push(result.data.id);
            successCount++;
          } else {
            failCount++;
            const errorMsg = result.error || result.data?.error || 'Unknown error';
            errors.push(`${file.name}: ${errorMsg}`);
            console.error('Upload failed for', file.name, ':', errorMsg);
          }
        } catch (error) {
          failCount++;
          const errorMsg = error instanceof Error ? error.message : 'Network error';
          errors.push(`${file.name}: ${errorMsg}`);
          console.error('Upload error for file:', file.name, error);
        }
      }

      // Reload images list
      await loadImages();

      // Select the first uploaded image
      if (uploadedIds.length > 0) {
        setSelectedImage(uploadedIds[0]);
      }

      // Show result message
      if (failCount > 0) {
        const errorSummary = errors.slice(0, 3).join('\n');
        const moreErrors = errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : '';
        alert(`Uploaded ${successCount} image(s) successfully. ${failCount} failed.\n\nFirst errors:\n${errorSummary}${moreErrors}`);
        console.error('All upload errors:', errors);
      } else {
        alert(`Successfully uploaded ${successCount} image(s)!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Create a fake event object to reuse upload logic
    const fakeEvent = {
      target: { files, value: '' }
    } as React.ChangeEvent<HTMLInputElement>;

    await handleUpload(fakeEvent);
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      setShowModal(false);
    }
  };

  const getImageUrl = (image: any) => {
    // Prefer the URL from API response, otherwise construct it
    if (typeof image === 'string') {
      return `${R2_PUBLIC_URL}/${image}`;
    }
    return image.url || `${R2_PUBLIC_URL}/${image.id}`;
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {currentImage ? (
          <img
            src={getImageUrl(currentImage)}
            alt="Current"
            className="w-20 h-20 object-cover rounded border"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
            }}
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center text-gray-400 text-xs">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}

        <Button
          type="button"
          onClick={() => setShowModal(true)}
          variant="default"
          size="sm"
        >
          {currentImage ? 'Change Image' : 'Select Image'}
        </Button>

        {currentImage && (
          <Button
            type="button"
            onClick={() => onSelect('')}
            variant="secondary"
            size="sm"
          >
            Remove
          </Button>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Select Image from R2 Storage</DialogTitle>
          </DialogHeader>

          <div className="p-4 border-b bg-gray-50">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <Button variant="default" className="bg-green-600 hover:bg-green-700" disabled={uploading} asChild>
                    <span>{uploading ? `Uploading...` : 'Choose Files'}</span>
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">or drag and drop images here</p>
                </div>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Max 10MB per file • Multiple files supported • JPEG, PNG, WebP, AVIF, GIF</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading images...</div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No images found. Upload your first image!
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImage(image.id)}
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${selectedImage === image.id
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={image.filename}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        console.error('Image load error:', image.id, 'URL:', getImageUrl(image));
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Error</text></svg>';
                      }}
                    />
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-600 truncate" title={image.filename}>
                        {image.filename}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(image.uploaded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedImage ? `Selected: ${images.find(img => img.id === selectedImage)?.filename || selectedImage}` : 'No image selected'}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelect}
                disabled={!selectedImage}
              >
                Select Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default R2ImagePicker;
