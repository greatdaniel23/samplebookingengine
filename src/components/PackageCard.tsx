import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types';
import { packageService } from '@/services/packageService';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Gift, 
  Star, 
  Calendar,
  Tag
} from 'lucide-react';

interface PackageCardProps {
  package: Package;
  onSelect?: (packageId: string) => void;
  showRoomOptions?: boolean;
  className?: string;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  onSelect,
  showRoomOptions = false,
  className = ''
}) => {
  const navigate = useNavigate();

  // Helper function to safely parse inclusions data
  const parseInclusions = (data: any): string[] => {
    try {
      // If it's already an array, return it
      if (Array.isArray(data)) {
        return data;
      }
      
      // If it's a string, try to parse as JSON
      if (typeof data === 'string' && data.trim().length > 0) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      // Default to empty array
      return [];
    } catch (error) {
      
      return [];
    }
  };

  // Parse inclusions safely
  const inclusions = parseInclusions(pkg.inclusions || pkg.includes);
  const discountPercentage = parseFloat(pkg.discount_percentage);
  const basePrice = parseFloat(pkg.price || pkg.base_price || '0');
  const originalPrice = basePrice / (1 - discountPercentage / 100);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(pkg.id);
    } else {
      // Navigate to booking page with package selected
      navigate(`/book?package=${pkg.id}`);
    }
  };

  // Get the image URL from either images array or image_url field
  const getPackageImageUrl = () => {
    // If pkg.images is an array and has items, use the first one
    if (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) {
      return pkg.images[0];
    }
    
    // Fallback to image_url field (for backward compatibility)
    if (pkg.image_url) {
      return pkg.image_url;
    }
    
    // Default images based on package type
    const typeImageMap: Record<string, string> = {
      'Romance': '/images/packages/romantic-escape.jpg',
      'Business': '/images/packages/business-elite.jpg',
      'Family': '/images/ui/placeholder.svg',
      'Adventure': '/images/ui/placeholder.svg',
      'Wellness': '/images/ui/placeholder.svg',
      'Culture': '/images/ui/placeholder.svg'
    };
    
    return typeImageMap[pkg.type] || '/images/ui/placeholder.svg';
  };

  return (
    <Card className={`card-hotel overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <CardHeader className="p-0">
        <div className="relative">
          <img 
            src={getPackageImageUrl()} 
            alt={pkg.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/ui/placeholder.svg';
            }}
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-hotel-gold text-white font-bold shadow-lg">
                <Tag className="h-3 w-3 mr-1" />
                {pkg.discount_display}
              </Badge>
            </div>
          )}

          {/* Package Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-hotel-navy/90 text-white backdrop-blur-sm">
              {packageService.getPackageTypeDisplayName(pkg.type || pkg.package_type)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="text-xl mb-2 line-clamp-1 text-hotel-navy">{pkg.name}</CardTitle>
        
        <p className="text-sm text-hotel-bronze mb-4 line-clamp-2">
          {pkg.description}
        </p>

        {/* Package Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-hotel-bronze">
            <Clock className="h-4 w-4 mr-2 text-hotel-gold" />
            <span>{pkg.min_nights}-{pkg.max_nights} nights</span>
          </div>
          
          <div className="flex items-center text-sm text-hotel-bronze">
            <Users className="h-4 w-4 mr-2 text-hotel-gold" />
            <span>Up to {pkg.max_guests} guests</span>
          </div>
          
          <div className="flex items-center text-sm text-hotel-bronze">
            <Calendar className="h-4 w-4 mr-2 text-hotel-gold" />
            <span className="text-xs">{pkg.validity_period}</span>
          </div>
        </div>

        {/* Included Services */}
        {inclusions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Gift className="h-4 w-4 mr-1" />
              What's Included:
            </h4>
            <div className="space-y-1">
              {inclusions.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center text-xs text-gray-600">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
              {inclusions.length > 3 && (
                <div className="text-xs text-gray-500 italic">
                  +{inclusions.length - 3} more benefits
                </div>
              )}
            </div>
          </div>
        )}

        {/* Room Options */}
        {showRoomOptions && pkg.room_options && pkg.room_options.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Available Rooms:</h4>
            <div className="space-y-1">
              {(pkg.room_options || []).slice(0, 2).map((room, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">{room.name}</span>
                  {room.price_override && (
                    <span className="font-medium">${room.price_override}/night</span>
                  )}
                </div>
              ))}
              {pkg.room_options && pkg.room_options.length > 2 && (
                <div className="text-xs text-gray-500 italic">
                  +{pkg.room_options.length - 2} more room types
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-2 bg-gray-50">
        <div className="w-full">
          {/* Pricing */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              {discountPercentage > 0 && (
                <span className="text-sm text-hotel-bronze line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-hotel-gold">
                  ${basePrice.toFixed(2)}
                </span>
                <span className="text-sm text-hotel-bronze">+ room rate</span>
              </div>
              {discountPercentage > 0 && (
                <span className="text-sm text-hotel-sage font-medium">
                  Save ${(originalPrice - basePrice).toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/packages/${pkg.id}`)}
                className="flex-1 btn-hotel-secondary border-hotel-gold text-hotel-bronze hover:bg-hotel-gold-light"
              >
                View Details
              </Button>
              <Button 
                onClick={handleSelect}
                className="flex-1 btn-hotel-primary"
              >
                Book Now
              </Button>
            </div>
          </div>

          {/* Terms */}
          {pkg.terms && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {pkg.terms}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PackageCard;
