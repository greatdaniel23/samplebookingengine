import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { getRoomImages } from '@/utils/images';
import { paths } from '@/config/paths';

interface ImageManagerProps {
  roomId: string;
  onImagesUpdated?: () => void;
}

export const ImageManager: React.FC<ImageManagerProps> = ({ roomId, onImagesUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roomImages = getRoomImages(roomId);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('room_id', roomId);

      // Add files with their types
      Array.from(files).forEach((file, index) => {
        const imageType = index === 0 ? 'main' : `gallery-${index}`;
        formData.append(`images[${imageType}]`, file);
      });

      const response = await fetch(paths.buildApiUrl('upload.php'), {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Successfully uploaded ${files.length} image(s)`);
        onImagesUpdated?.();
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const ImagePreview: React.FC<{ src: string; title: string; onRemove?: () => void }> = ({
    src,
    title,
    onRemove
  }) => (
    <div className="relative group">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={src}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/ui/placeholder.svg';
          }}
        />
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
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Room Images - {roomId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <Label htmlFor="image-upload">Upload Images</Label>
          <div className="flex items-center gap-4">
            <Input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              onClick={handleFileSelect}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Select Images'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Select multiple images. First image will be the main room image.
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

        {/* Current Images */}
        <div className="space-y-4">
          <Label>Current Images</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ImagePreview
              src={roomImages.main}
              title="Main Image"
            />
            {roomImages.gallery.map((imageSrc, index) => (
              <ImagePreview
                key={index}
                src={imageSrc}
                title={`Gallery ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Image Guidelines:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Main image: 1200x800px (3:2 ratio) recommended</li>
            <li>• Gallery images: 1200x800px (3:2 ratio) recommended</li>
            <li>• Supported formats: JPG, PNG, WebP</li>
            <li>• Maximum file size: 5MB per image</li>
            <li>• Images will be automatically optimized</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageManager;