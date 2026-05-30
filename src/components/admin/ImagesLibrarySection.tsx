import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { paths } from '@/config/paths';
import { getAuthToken } from '@/config/cloudflare';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  Search,
  X,
  FolderOpen,
  ExternalLink,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface R2Image {
  id: string;        // R2 key  e.g. "rooms/1234-abc.jpg"
  filename: string;  // leaf name e.g. "1234-abc.jpg"
  uploaded: string;  // ISO timestamp
  size: number;      // bytes
  url: string;       // public CDN URL
}

interface UsageInfo {
  used: boolean;
  used_by_rooms: string[];
  used_by_packages: string[];
  used_by_homepage: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FOLDERS = [
  { value: '',            label: 'All' },
  { value: 'rooms/',      label: 'Rooms' },
  { value: 'packages/',   label: 'Packages' },
  { value: 'villa/',      label: 'Villa' },
  { value: 'marketing/',  label: 'Marketing' },
  { value: 'misc/',       label: 'Misc' },
];

// imageroom bucket is bound to image.alphadigitalagency.id (canonical custom domain).
// Samudra objects are namespaced under samudra/ prefix for multi-tenant isolation.
const R2_PUBLIC_URL = 'https://image.alphadigitalagency.id/samudra';
const API_BASE = paths.apiBase;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getImageUrl(image: R2Image): string {
  return image.url || `${R2_PUBLIC_URL}/${image.id}`;
}

// ── Main Component ─────────────────────────────────────────────────────────────

const ImagesLibrarySection: React.FC = () => {
  const [images, setImages] = useState<R2Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('misc/');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Delete soft-block state
  const [deleteTarget, setDeleteTarget] = useState<R2Image | null>(null);
  const [deleteUsage, setDeleteUsage] = useState<UsageInfo | null>(null);
  const [checkingUsage, setCheckingUsage] = useState(false);
  const [showDeleteBlock, setShowDeleteBlock] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Load images ─────────────────────────────────────────────────────────────

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeFolder
        ? `${API_BASE}/images/list?prefix=${encodeURIComponent(activeFolder)}`
        : `${API_BASE}/images/list`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setImages(data.data.files || []);
      } else {
        toast.error('Failed to load images');
      }
    } catch (err) {
      console.error('Load images error:', err);
      toast.error('Failed to connect to image storage');
    } finally {
      setLoading(false);
    }
  }, [activeFolder]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // ── Filtered images ──────────────────────────────────────────────────────────

  const filteredImages = images.filter((img) => {
    if (!searchQuery) return true;
    return img.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalSize = images.reduce((acc, img) => acc + (img.size || 0), 0);

  // ── Upload ───────────────────────────────────────────────────────────────────

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

    if (fileArray.length > 50) {
      toast.error('Max 50 files per upload');
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    const token = getAuthToken();
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('prefix', uploadFolder);

        const resp = await fetch(`${API_BASE}/images/upload`, {
          method: 'POST',
          headers: authHeaders,
          body: formData,
        });
        const result = await resp.json();
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error('Upload failed:', file.name, result.error);
        }
      } catch (err) {
        failCount++;
        console.error('Upload error:', file.name, err);
      }
    }

    setUploading(false);
    setShowUploadModal(false);

    if (failCount > 0) {
      toast.error(`${failCount} upload(s) failed`, { description: `${successCount} succeeded.` });
    } else {
      toast.success(`${successCount} image(s) uploaded`);
    }

    // Reload to show new images — switch to the uploaded folder
    setActiveFolder(uploadFolder === 'misc/' && activeFolder === '' ? '' : uploadFolder);
    await loadImages();
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

  // ── Copy URL ─────────────────────────────────────────────────────────────────

  const handleCopyUrl = async (image: R2Image) => {
    try {
      await navigator.clipboard.writeText(getImageUrl(image));
      toast.success('URL copied');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  // ── Delete (soft-block) ───────────────────────────────────────────────────────

  const handleDeleteClick = async (image: R2Image) => {
    setDeleteTarget(image);
    setCheckingUsage(true);

    try {
      const resp = await fetch(
        `${API_BASE}/images/usage?key=${encodeURIComponent(image.id)}`
      );
      const data = await resp.json();
      if (data.success) {
        const usage: UsageInfo = data.data;
        setDeleteUsage(usage);
        if (usage.used) {
          setShowDeleteBlock(true);
        } else {
          setShowDeleteConfirm(true);
        }
      } else {
        // If usage check fails, still allow delete with warning
        setDeleteUsage(null);
        setShowDeleteConfirm(true);
      }
    } catch (err) {
      console.error('Usage check error:', err);
      setDeleteUsage(null);
      setShowDeleteConfirm(true);
    } finally {
      setCheckingUsage(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const token = getAuthToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const resp = await fetch(`${API_BASE}/images/${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await resp.json();
      if (data.success) {
        toast.success('Image deleted');
        setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
      } else {
        toast.error('Delete failed', { description: data.error || 'Unknown error' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setDeleteUsage(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteBlock(false);
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
    setDeleteUsage(null);
  };

  // ── Usage summary text ────────────────────────────────────────────────────────

  const usageSummary = (usage: UsageInfo | null): string => {
    if (!usage) return '';
    const parts: string[] = [];
    if (usage.used_by_rooms.length > 0) {
      parts.push(`${usage.used_by_rooms.length} room(s): ${usage.used_by_rooms.join(', ')}`);
    }
    if (usage.used_by_packages.length > 0) {
      parts.push(`${usage.used_by_packages.length} package(s): ${usage.used_by_packages.join(', ')}`);
    }
    if (usage.used_by_homepage) {
      parts.push('homepage settings');
    }
    return parts.join(' · ');
  };

  // ── Empty state ──────────────────────────────────────────────────────────────

  const EmptyState: React.FC = () => (
    <div
      className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-samudra-paper-deep rounded"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <FolderOpen className="w-12 h-12 text-samudra-ink-mute mb-4" />
      <p className="font-display text-[18px] text-samudra-ink mb-1">No images here</p>
      <p className="text-[13px] text-samudra-ink-mute mb-4">
        {activeFolder ? `No images in ${activeFolder}` : 'Upload your first image to get started'}
      </p>
      <Button
        onClick={() => setShowUploadModal(true)}
        className="bg-samudra-teal text-samudra-paper hover:bg-samudra-teal/90 eyebrow"
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Images
      </Button>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[28px] font-normal text-samudra-ink leading-tight">
            Images
          </h2>
          <p className="eyebrow text-samudra-ink-mute mt-1">
            {images.length} image{images.length !== 1 ? 's' : ''} · {formatBytes(totalSize)}
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-samudra-teal text-samudra-paper hover:bg-samudra-teal/90 eyebrow flex-shrink-0"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Images
        </Button>
      </div>

      {/* Folder chips + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {FOLDERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setActiveFolder(f.value); setSearchQuery(''); }}
              className={`eyebrow px-3 py-1.5 rounded transition-colors ${
                activeFolder === f.value
                  ? 'bg-samudra-teal text-samudra-paper'
                  : 'bg-samudra-paper-soft text-samudra-ink-mute hover:bg-samudra-paper-deep'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-samudra-ink-mute pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename…"
            className="h-9 w-full bg-samudra-paper border border-samudra-paper-deep pl-9 pr-3 text-[13px] text-samudra-ink placeholder:text-samudra-ink-mute focus:outline-none focus:border-samudra-teal transition-colors rounded"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="aspect-square bg-samudra-paper-deep animate-pulse rounded" />
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filteredImages.map((image) => (
            <ImageTile
              key={image.id}
              image={image}
              checking={checkingUsage && deleteTarget?.id === image.id}
              onCopy={() => handleCopyUrl(image)}
              onDelete={() => handleDeleteClick(image)}
            />
          ))}
        </div>
      )}

      {/* ── Upload Modal ── */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-samudra-paper-deep">
            <DialogTitle className="font-display text-[22px] font-normal text-samudra-ink">
              Upload Images
            </DialogTitle>
            <DialogDescription className="text-[13px] text-samudra-ink-mute mt-1">
              Select a folder then drop or pick files. Max 10 MB · JPEG, PNG, WebP, AVIF, GIF.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            {/* Folder selector */}
            <div>
              <label className="eyebrow text-samudra-ink-mute block mb-1.5">Target folder</label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] text-samudra-ink focus:outline-none focus:border-samudra-teal transition-colors rounded"
              >
                {FOLDERS.filter(f => f.value !== '').map((f) => (
                  <option key={f.value} value={f.value}>{f.label} ({f.value})</option>
                ))}
              </select>
            </div>

            {/* Drag-drop zone */}
            <div
              className={`border-2 border-dashed rounded p-8 text-center transition-colors ${
                dragActive
                  ? 'border-samudra-teal bg-samudra-paper-soft'
                  : 'border-samudra-paper-deep'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label className="flex flex-col items-center gap-3 cursor-pointer">
                <Upload className="w-10 h-10 text-samudra-ink-mute" />
                <div>
                  <Button
                    type="button"
                    disabled={uploading}
                    className="bg-samudra-teal text-samudra-paper hover:bg-samudra-teal/90 eyebrow"
                    asChild
                  >
                    <span>{uploading ? 'Uploading…' : 'Choose Files'}</span>
                  </Button>
                  <p className="text-[12px] text-samudra-ink-mute mt-2">or drag and drop here</p>
                </div>
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
          </div>

          <div className="px-6 pb-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUploadModal(false)} disabled={uploading}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete BLOCKED modal (image is referenced) ── */}
      <Dialog open={showDeleteBlock} onOpenChange={(v) => { if (!v) cancelDelete(); }}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-samudra-paper-deep">
            <DialogTitle className="font-display text-[22px] font-normal text-samudra-ink">
              Cannot delete — image in use
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 space-y-3">
            {deleteTarget && (
              <div className="flex items-center gap-3 p-3 bg-samudra-paper-soft rounded border border-samudra-paper-deep">
                <img
                  src={getImageUrl(deleteTarget)}
                  alt={deleteTarget.filename}
                  className="w-14 h-14 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect fill="%23ddd"/></svg>';
                  }}
                />
                <div>
                  <p className="text-[13px] font-medium text-samudra-ink truncate max-w-[200px]">{deleteTarget.filename}</p>
                  <p className="text-[11px] text-samudra-ink-mute mt-0.5">{formatBytes(deleteTarget.size)}</p>
                </div>
              </div>
            )}
            <p className="text-[13px] text-samudra-ink">
              This image is still referenced by:
            </p>
            <p className="text-[13px] text-samudra-ink-mute bg-samudra-paper-soft border border-samudra-paper-deep rounded px-3 py-2">
              {usageSummary(deleteUsage)}
            </p>
            <p className="text-[12px] text-samudra-ink-mute">
              Detach it from all rooms / packages / homepage first, then delete.
            </p>
          </div>
          <div className="px-6 pb-6 flex justify-end">
            <Button onClick={cancelDelete} className="bg-samudra-teal text-samudra-paper hover:bg-samudra-teal/90 eyebrow">
              OK, Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete CONFIRM dialog (image is unused) ── */}
      <AlertDialog open={showDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[20px] font-normal">
              Delete image?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-samudra-ink-mute">
              {deleteTarget?.filename} will be permanently removed from storage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ── ImageTile sub-component ────────────────────────────────────────────────────

interface ImageTileProps {
  image: R2Image;
  checking: boolean;
  onCopy: () => void;
  onDelete: () => void;
}

const ImageTile: React.FC<ImageTileProps> = ({ image, checking, onCopy, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative aspect-square bg-samudra-paper-deep rounded overflow-hidden group border border-samudra-paper-deep hover:border-samudra-teal transition-colors"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={getImageUrl(image)}
        alt={image.filename}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src =
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23e5e1d8"/><text x="50%" y="55%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12">Error</text></svg>';
        }}
      />

      {/* Hover overlay */}
      {hovered && (
        <div className="absolute inset-0 bg-samudra-ink/60 flex flex-col justify-between p-2">
          <p className="text-[10px] text-samudra-paper leading-tight truncate">{image.filename}</p>
          <div>
            <p className="text-[9px] text-samudra-paper/70 mb-1.5">{formatBytes(image.size)}</p>
            <div className="flex gap-1">
              <button
                onClick={onCopy}
                title="Copy URL"
                className="flex-1 flex items-center justify-center gap-1 py-1 bg-samudra-paper/20 hover:bg-samudra-paper/40 rounded text-samudra-paper transition-colors"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={onDelete}
                disabled={checking}
                title="Delete"
                className="flex-1 flex items-center justify-center gap-1 py-1 bg-red-500/70 hover:bg-red-500 rounded text-samudra-paper transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesLibrarySection;
