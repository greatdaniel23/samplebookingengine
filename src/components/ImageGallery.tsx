import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Download, Search, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/config/paths';

// Using centralized API configuration

interface ImageItem {
  name: string;
  path: string;
  category: string;
  type: string;
  size: number;
  modified: number;
  url: string;
  fullUrl: string;
}

interface ImageStats {
  totalImages: number;
  totalCategories: number;
  categoryCounts: { [key: string]: number };
  lastUpdated: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    images: ImageItem[];
    imagesByCategory: { [key: string]: ImageItem[] };
    statistics: ImageStats;
  };
  message: string;
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
  const [imagesByCategory, setImagesByCategory] = useState<{ [key: string]: ImageItem[] }>({});
  const [statistics, setStatistics] = useState<ImageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/images.php`);
        const data: ApiResponse = await response.json();
        
        if (data.success) {
          setImages(data.data.images);
          setFilteredImages(data.data.images);
          setImagesByCategory(data.data.imagesByCategory);
          setStatistics(data.data.statistics);
        } else {
          setError('Failed to load images');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Filter images based on search and filters
  useEffect(() => {
    let filtered = images;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(img => img.type === selectedType);
    }

    setFilteredImages(filtered);
  }, [images, searchTerm, selectedCategory, selectedType]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const getImageTypeColor = (type: string) => {
    switch (type) {
      case 'jpg': case 'jpeg': return 'bg-blue-100 text-blue-800';
      case 'png': return 'bg-green-100 text-green-800';
      case 'svg': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hero': return 'bg-red-100 text-red-800';
      case 'packages': return 'bg-blue-100 text-blue-800';
      case 'amenities': return 'bg-green-100 text-green-800';
      case 'ui': return 'bg-purple-100 text-purple-800';
      case 'rooms': return 'bg-yellow-100 text-yellow-800';
      case 'villa': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const categories = ['all', ...Object.keys(imagesByCategory)];
  const types = ['all', ...new Set(images.map(img => img.type))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <ImageIcon className="text-blue-600" />
            Image Gallery Manager
          </h1>
          <p className="text-gray-600 text-lg">
            Browse and manage all images from the <code className="bg-gray-200 px-2 py-1 rounded">/public/images</code> directory
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Images</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : statistics?.totalImages || images.length}
                  </p>
                </div>
                <ImageIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '...' : statistics?.totalCategories || Object.keys(imagesByCategory).length}
                  </p>
                </div>
                <FolderOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hero Images</p>
                  <p className="text-2xl font-bold text-red-600">
                    {loading ? '...' : statistics?.categoryCounts?.hero || imagesByCategory.hero?.length || 0}
                  </p>
                </div>
                <ImageIcon className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Filtered</p>
                  <p className="text-2xl font-bold text-purple-600">{filteredImages.length}</p>
                </div>
                <Search className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Images</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading images...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-red-600 mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Images</h3>
              <p className="text-gray-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Image Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <Card key={`${image.category}-${image.name}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                  {image.type === 'svg' ? (
                    <img 
                      src={image.url} 
                      alt={image.name}
                      className="max-w-full max-h-full object-contain p-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/ui/no-image.svg';
                      }}
                    />
                  ) : (
                    <img 
                      src={image.url} 
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/ui/no-image.svg';
                      }}
                    />
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 truncate" title={image.name}>
                      {image.name}
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getCategoryColor(image.category)}>
                        {image.category}
                      </Badge>
                      <Badge className={getImageTypeColor(image.type)}>
                        {image.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {formatFileSize(image.size)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500">Relative URL:</label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 p-1 rounded flex-1 truncate">
                          {image.url}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(image.url, 'Relative URL')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500">Full URL:</label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 p-1 rounded flex-1 truncate">
                          {image.fullUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(image.fullUrl, 'Full URL')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(image.fullUrl, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadImage(image.fullUrl, image.name)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredImages.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        {!loading && !error && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Directory Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(imagesByCategory).map(([category, files]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      /images/{category}/
                    </h4>
                    <p className="text-sm text-gray-600">
                      {files.length} files
                      {files.length === 0 && ' (empty)'}
                    </p>
                    {files.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Types: {[...new Set(files.map(f => f.type))].join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {statistics && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(statistics.lastUpdated).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;