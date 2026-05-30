import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Camera, Plus, X, Star, Upload, Check, FolderOpen } from 'lucide-react';
import { paths } from '@/config/paths';
import { getAuthToken } from '@/config/cloudflare';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getImageUrl as getR2ImageUrl } from '@/config/r2';

// Worker base URL — used for images and for mutation requests (PUT/DELETE)
// CF Pages _redirects only proxies GET; PUT returns 405. All mutations go direct to Worker.
const WORKER_BASE = 'https://booking-engine-api-samudra.danielsantosomarketing2017.workers.dev';
const WORKER_IMAGE_BASE = `${WORKER_BASE}/api/images`;
const WORKER_ROOMS_BASE = `${WORKER_BASE}/api/rooms`;
const API_BASE = paths.apiBase;

const FOLDERS = [
  { value: '',           label: 'All' },
  { value: 'rooms/',     label: 'Rooms' },
  { value: 'packages/',  label: 'Packages' },
  { value: 'villa/',     label: 'Villa' },
  { value: 'marketing/', label: 'Marketing' },
  { value: 'misc/',      label: 'Misc' },
];

interface LibraryImage {
  id: string;
  filename: string;
  uploaded: string;
  size: number;
  url: string;
}

function getWorkerImageUrl(image: LibraryImage): string {
  return image.url || `${WORKER_IMAGE_BASE}/${image.id}`;
}

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
  const [loadingRoom, setLoadingRoom] = useState(false);

  // Picker modal state
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState('rooms/');
  const [selectedImageId, setSelectedImageId] = useState<string>('');

  // Upload state (inside picker)
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Fetch current room images on mount
  useEffect(() => {
    if (roomId) {
      fetchRoomImages();
    }
  }, [roomId]);

  // Load library images when modal opens or folder changes
  useEffect(() => {
    if (showPickerModal) {
      loadLibraryImages();
    }
  }, [showPickerModal, activeFolder]);

  const fetchRoomImages = async () => {
    try {
      const response = await fetch(paths.buildApiUrl(`rooms/${roomId}`));
      const data = await response.json();

      if (data.success && data.data && data.data.images) {
        let images = data.data.images;
        if (typeof images === 'string') {
          try { images = JSON.parse(images); } catch { images = []; }
        }
        const normalizedImages = (Array.isArray(images) ? images : []).map((img: any) => {
          if (typeof img === 'string') {
            return { url: getR2ImageUrl(img), filename: img, is_primary: false };
          }
          return { ...img, url: getR2ImageUrl(img.url || img.filename) };
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

  const loadLibraryImages = async () => {
    setLibraryLoading(true);
    try {
      const url = activeFolder
        ? `${API_BASE}/images/list?prefix=${encodeURIComponent(activeFolder)}`
        : `${API_BASE}/images/list`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setLibraryImages(data.data?.files || []);
      } else {
        toast.error('Failed to load images');
        setLibraryImages([]);
      }
    } catch (err) {
      console.error('Load images error:', err);
      toast.error('Failed to connect to image storage');
      setLibraryImages([]);
    } finally {
      setLibraryLoading(false);
    }
  };

  const updateRoomImages = async (newImages: any[]) => {
    setLoadingRoom(true);
    try {
      // CF Pages _redirects does not proxy PUT (405). Hit the Worker directly.
      // Auth token required — worker PUT /api/rooms/:id is gated by requireAuth.
      const token = getAuthToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(
        `${WORKER_ROOMS_BASE}/${roomId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ id: roomId, images: newImages }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setRoomImages(newImages);
        if (onImageSelect) onImageSelect(newImages);
      } else {
        throw new Error(data.error || 'Failed to update images');
      }
    } catch (error) {
      console.error('Error updating images:', error);
      toast.error('Could not update images');
    } finally {
      setLoadingRoom(false);
    }
  };

  // Called when user clicks "Use Selected Image"
  const handleConfirmSelection = () => {
    if (!selectedImageId) return;
    const selected = libraryImages.find(img => img.id === selectedImageId);
    if (!selected) return;

    const imageUrl = getWorkerImageUrl(selected);
    const newImageObj = {
      url: imageUrl,
      filename: selected.filename,
      is_primary: roomImages.length === 0,
      caption: '',
      added_at: new Date().toISOString(),
    };

    const newImages = [...roomImages, newImageObj];
    updateRoomImages(newImages);
    setSelectedImageId('');
    setShowPickerModal(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = roomImages.filter((_, index) => index !== indexToRemove);
    updateRoomImages(newImages);
  };

  const handleSetPrimary = (indexToPrimary: number) => {
    const newImages = roomImages.map((img, index) => ({
      ...img,
      is_primary: index === indexToPrimary,
    }));
    updateRoomImages(newImages);
  };

  // Upload files directly into the picker
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const invalid = fileArray.filter(f => {
      if (f.size > 10 * 1024 * 1024) return true;
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'].includes(f.type)) return true;
      return false;
    });

    if (invalid.length > 0) {
      toast.error(`${invalid.length} file(s) invalid — must be JPEG/PNG/WebP/AVIF/GIF, max 10 MB`);
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    const token = getAuthToken();
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const uploadPrefix = activeFolder || 'rooms/';

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('prefix', uploadPrefix);

        const resp = await fetch(`${API_BASE}/images/upload`, {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });
        const result = await resp.json();
        if (result.success) successCount++;
        else { failCount++; console.error('Upload failed:', file.name, result.error); }
      } catch (err) {
        failCount++;
        console.error('Upload error:', file.name, err);
      }
    }

    setUploading(false);

    if (failCount > 0) {
      toast.error(`${failCount} upload(s) failed`, { description: `${successCount} succeeded.` });
    } else {
      toast.success(`${successCount} image(s) uploaded`);
    }

    // Reload library
    await loadLibraryImages();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    await handleUploadFiles(e.dataTransfer.files);
  };

  const openPickerModal = () => {
    setSelectedImageId('');
    setActiveFolder('rooms/');
    setShowPickerModal(true);
  };

  return (
    <div className={`room-images-manager ${className}`}>
      {/* Inline image thumbnails */}
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow text-samudra-ink-mute">
          Images ({roomImages.length})
        </span>
        <button
          onClick={openPickerModal}
          disabled={loadingRoom}
          className="flex items-center gap-1 px-3 py-1 border border-samudra-teal rounded text-samudra-teal hover:bg-samudra-teal hover:text-samudra-paper transition-colors eyebrow text-[10px]"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          <Plus size={12} />
          Add Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roomImages.map((image, index) => (
          <div key={index} className="relative group border border-samudra-paper-deep overflow-hidden rounded">
            <img
              src={typeof image === 'string' ? getR2ImageUrl(image) : (image.url || getR2ImageUrl(image.filename))}
              alt="Room"
              className={`w-full h-24 object-cover ${image.is_primary ? 'ring-2 ring-samudra-gold' : ''}`}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Img</text></svg>';
              }}
            />
            {image.is_primary && (
              <div className="absolute top-1 left-1 bg-samudra-gold rounded-full p-0.5 shadow-sm">
                <Star size={10} className="text-white fill-current" />
              </div>
            )}
            <div className="absolute inset-0 bg-samudra-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!image.is_primary && (
                <button
                  onClick={() => handleSetPrimary(index)}
                  className="p-1 bg-samudra-gold rounded text-white hover:bg-samudra-gold/80"
                  title="Set as primary"
                >
                  <Star size={12} />
                </button>
              )}
              <button
                onClick={() => handleRemoveImage(index)}
                className="p-1 bg-[#7a3d31] rounded text-white hover:bg-[#7a3d31]/80"
                title="Remove"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}

        {roomImages.length === 0 && (
          <div
            className="col-span-full py-6 text-center border-2 border-dashed border-samudra-paper-deep cursor-pointer hover:border-samudra-teal transition-colors"
            onClick={openPickerModal}
          >
            <Camera className="mx-auto mb-2 text-samudra-ink-mute opacity-40" size={20} />
            <p className="eyebrow text-samudra-ink-mute">No images — click to add</p>
          </div>
        )}
      </div>

      {/* Visual Image Picker Modal */}
      <Dialog open={showPickerModal} onOpenChange={(open) => { if (!open) { setShowPickerModal(false); setSelectedImageId(''); } }}>
        <DialogContent
          className="max-w-3xl bg-samudra-paper border border-samudra-paper-deep p-0"
          style={{ boxShadow: '0 32px 96px rgba(10,14,20,0.22), 0 4px 16px rgba(10,14,20,0.10)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-samudra-paper-deep flex-shrink-0">
            <DialogTitle className="font-display text-[22px] font-light text-samudra-ink">
              Choose an image from your library
            </DialogTitle>
            <DialogDescription className="eyebrow text-samudra-ink-mute mt-1">
              Select a thumbnail, then click "Use Selected Image"
            </DialogDescription>
          </DialogHeader>

          {/* Folder filter chips + Upload button */}
          <div className="px-6 py-3 border-b border-samudra-paper-deep flex-shrink-0 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex flex-wrap gap-2">
              {FOLDERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActiveFolder(f.value)}
                  className={`eyebrow px-3 py-1.5 transition-colors text-[10px] tracking-[0.15em] uppercase ${
                    activeFolder === f.value
                      ? 'bg-samudra-teal text-samudra-paper'
                      : 'bg-samudra-paper-soft text-samudra-ink-mute hover:bg-samudra-paper-deep'
                  }`}
                  style={{ fontFamily: 'var(--font-label)' }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {/* Upload trigger */}
            <label
              className={`flex items-center gap-1.5 px-4 py-1.5 border cursor-pointer eyebrow text-[10px] tracking-[0.15em] uppercase transition-colors ${
                uploading
                  ? 'border-samudra-ink-mute text-samudra-ink-mute cursor-not-allowed'
                  : 'border-samudra-teal text-samudra-teal hover:bg-samudra-teal hover:text-samudra-paper'
              }`}
              style={{ fontFamily: 'var(--font-label)' }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={12} />
              {uploading ? 'Uploading…' : 'Upload New'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                multiple
                disabled={uploading}
                className="hidden"
                onChange={(e) => handleUploadFiles(e.target.files)}
              />
            </label>
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            {libraryLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-samudra-paper-deep animate-pulse rounded" />
                ))}
              </div>
            ) : libraryImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FolderOpen className="w-10 h-10 text-samudra-ink-mute mb-3 opacity-40" />
                <p className="font-display text-[16px] text-samudra-ink mb-1">No images in this folder yet</p>
                <p className="eyebrow text-samudra-ink-mute">Upload one using the button above</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {libraryImages.map((image) => {
                  const isSelected = selectedImageId === image.id;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageId(isSelected ? '' : image.id)}
                      className={`relative group text-left overflow-hidden transition-all focus:outline-none ${
                        isSelected
                          ? 'ring-2 ring-samudra-teal ring-offset-2'
                          : 'ring-1 ring-samudra-ink-mute/10 hover:ring-samudra-ink-mute/40'
                      }`}
                      title={image.filename}
                    >
                      {/* Checkmark badge */}
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 z-10 bg-samudra-teal rounded-full p-0.5 shadow">
                          <Check size={10} className="text-samudra-paper" />
                        </span>
                      )}
                      <img
                        src={getWorkerImageUrl(image)}
                        alt={image.filename}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Error</text></svg>';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-samudra-ink/70 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1">
                        <p className="eyebrow text-samudra-paper text-[9px] truncate">{image.filename}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-samudra-paper-deep flex-shrink-0 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              {selectedImageId ? (
                <p className="eyebrow text-samudra-ink text-[11px] truncate">
                  Selected: {libraryImages.find(img => img.id === selectedImageId)?.filename || selectedImageId}
                </p>
              ) : (
                <p className="eyebrow text-samudra-ink-mute text-[11px]">No image selected</p>
              )}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                className="h-10 border-samudra-ink text-samudra-ink bg-samudra-paper hover:bg-samudra-paper-soft eyebrow text-[10px] tracking-[0.2em] uppercase px-5"
                style={{ fontFamily: 'var(--font-label)' }}
                onClick={() => { setShowPickerModal(false); setSelectedImageId(''); }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!selectedImageId || loadingRoom}
                className="h-10 bg-samudra-teal text-samudra-paper hover:bg-samudra-teal/90 disabled:opacity-40 eyebrow text-[10px] tracking-[0.2em] uppercase px-5"
                style={{ fontFamily: 'var(--font-label)' }}
                onClick={handleConfirmSelection}
              >
                Use Selected Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomImageButton;
