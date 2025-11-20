import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types';
import { packageService } from '@/services/packageService';
import { useVillaInfo } from '@/hooks/useVillaInfo';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Gift, 
  Star, 
  Calendar,
  Tag,
  CheckCircle2,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import NotFound from './NotFound';
import BookingSkeleton from '@/components/BookingSkeleton';

const PackageDetails = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { villaInfo } = useVillaInfo();
  const [pkg, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to safely parse inclusions data
  const parseInclusions = (data: any): string[] => {
    try {
      if (Array.isArray(data)) {
        return data;
      }
      if (typeof data === 'string' && data.trim().length > 0) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.warn('Failed to parse inclusions data:', data, error);
      return [];
    }
  };
  const [error, setError] = useState<string | null>(null);

  // Dynamic contact information helpers
  const getContactPhone = () => {
    return villaInfo?.phone || "+1 (555) 123-4567";
  };

  const getContactEmail = () => {
    return villaInfo?.email || "support@villa.com";
  };

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await packageService.getPackageById(packageId);
        setPackage(response.data);
      } catch (err) {
        setError("Failed to fetch package details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  if (loading) {
    return <BookingSkeleton />;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!pkg) {
    return <NotFound />;
  }

  // Check if package is inactive - redirect to not found for customers
  if (!pkg.available) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Package Not Available</h2>
            <p className="text-muted-foreground mb-4">
              This package is currently not available for booking.
            </p>
            <Button onClick={() => navigate('/packages')}>
              View Available Packages
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const discountPercentage = parseFloat(pkg.discount_percentage);
  const basePrice = parseFloat(pkg.price || pkg.base_price || '0');
  const originalPrice = basePrice / (1 - discountPercentage / 100);

  const handleBookNow = () => {
    navigate(`/book?package=${pkg.id}`);
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
    
    return typeImageMap[pkg.type || pkg.package_type] || '/images/ui/placeholder.svg';
  };

  return (
    <div className="bg-gradient-to-br from-white to-hotel-cream min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/packages')} className="flex items-center text-hotel-bronze hover:text-hotel-gold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Button>
          <Link to="/" className="text-sm text-hotel-bronze hover:text-hotel-gold transition-colors">
            Home
          </Link>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Section */}
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={getPackageImageUrl()} 
                alt={pkg.name}
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/ui/placeholder.svg';
                }}
              />
              
              {/* Package Type Badge */}
              <div className="absolute top-4 left-4">
                <Badge 
                  variant="secondary" 
                  className={`text-white border-0 ${packageService.getPackageTypeColor(pkg.type || pkg.package_type)}`}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {(pkg.type || pkg.package_type)?.charAt(0).toUpperCase() + (pkg.type || pkg.package_type)?.slice(1)}
                </Badge>
              </div>

              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-hotel-gold text-white border-0 text-sm shadow-lg">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-8">
              <h1 className="text-4xl font-bold mb-4 text-hotel-navy">{pkg.name}</h1>
              <p className="text-lg text-hotel-bronze mb-6 leading-relaxed">
                {pkg.description}
              </p>

              {/* Package Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm text-muted-foreground">Max Guests</div>
                  <div className="font-semibold">{pkg.max_guests}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold">{pkg.min_nights}-{pkg.max_nights} nights</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-sm text-muted-foreground">Valid Until</div>
                  <div className="font-semibold text-xs">{new Date(pkg.valid_until).toLocaleDateString()}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Gift className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-sm text-muted-foreground">Includes</div>
                  <div className="font-semibold">{(pkg.inclusions || pkg.includes || []).length} items</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Includes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2" />
                What's Included
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parseInclusions(pkg.inclusions || pkg.includes).map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Rooms */}
          {pkg.room_options && pkg.room_options.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Available Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(pkg.room_options || []).map((room, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-medium">{room.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Priority {room.priority} • Premium room option
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          ${room.price_override}/night
                        </div>
                        <div className="text-xs text-muted-foreground">
                          + package rate
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms & Conditions */}
          {pkg.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pkg.terms}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Book This Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  {discountPercentage > 0 && (
                    <div className="text-sm text-muted-foreground line-through mb-1">
                      ${originalPrice.toFixed(2)} per night
                    </div>
                  )}
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${basePrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per night + room rate
                  </div>
                  {discountPercentage > 0 && (
                    <div className="text-sm font-medium text-green-600 mt-2">
                      Save ${(originalPrice - basePrice).toFixed(2)} per night!
                    </div>
                  )}
                </div>

                {/* Package Validity */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Valid Period</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    {new Date(pkg.valid_from).toLocaleDateString()} - {new Date(pkg.valid_until).toLocaleDateString()}
                  </p>
                </div>

                {/* Key Features */}
                <div className="space-y-3">
                  <h4 className="font-medium">Key Features:</h4>
                  <div className="space-y-2">
                    {parseInclusions(pkg.inclusions || pkg.includes).slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Star className="h-3 w-3 mr-2 text-yellow-500" />
                        <span className="line-clamp-1">{item}</span>
                      </div>
                    ))}
                    {parseInclusions(pkg.inclusions || pkg.includes).length > 4 && (
                      <div className="text-xs text-muted-foreground italic">
                        +{parseInclusions(pkg.inclusions || pkg.includes).length - 4} more benefits included
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleBookNow}
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Book Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/packages')}
                  >
                    Compare Packages
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-3">
                    Need help choosing? Contact us:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 mr-2" />
                      <span>{getContactPhone()}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 mr-2" />
                      <span>{getContactEmail()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PackageDetails;