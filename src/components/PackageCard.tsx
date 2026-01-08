import React, { useState, useEffect } from 'react';
// Removed Card components for Marriott-style design
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from '@/types';
import { packageService } from '@/services/packageService';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/config/paths';
import {
    Clock,
    Users,
    Gift,
    Star,
    Calendar,
    Tag,
    Wifi, Car, Heart, Coffee, Bath, Sparkles, Check,
    Utensils, Plane, Map, Headphones, Waves, ChefHat,
    Sun, Music, Home, Mountain, Apple, Wine, Bus, Bike,
    Activity, Leaf, Dumbbell, Zap, Shirt, Archive, Phone,
    Camera, Flower, PartyPopper
} from 'lucide-react';

interface PackageCardProps {
    package: Package;
    onSelect?: (packageId: string) => void;
    showRoomOptions?: boolean;
    className?: string;
    dateFilters?: {
        checkIn: string;
        checkOut: string;
        adults: number;
        children: number;
    };
}

export const PackageCard: React.FC<PackageCardProps> = ({
    package: pkg,
    onSelect,
    showRoomOptions = false,
    className = '',
    dateFilters
}) => {
    const navigate = useNavigate();
    const [packageInclusions, setPackageInclusions] = useState<any[]>([]);
    const [inclusionsLoading, setInclusionsLoading] = useState(true);

    // Icon mapper function to convert backend icon strings to Lucide React components
    const getAmenityIcon = (iconName: string) => {
        const iconMap: { [key: string]: any } = {
            'wifi': Wifi, 'car': Car, 'heart': Heart, 'coffee': Coffee, 'bath': Bath,
            'sparkles': Sparkles, 'star': Star
        };
        return iconMap[iconName?.toLowerCase()] || Star;
    };

    // Icon mapper for inclusions
    const getInclusionIcon = (iconName: string) => {
        const iconMap: { [key: string]: any } = {
            'check': Check, 'check-circle': Check, 'coffee': Coffee, 'utensils': Utensils,
            'heart': Heart, 'cup-soda': Coffee, 'apple': Apple, 'wine': Wine,
            'car': Car, 'plane': Plane, 'bus': Bus, 'bike': Bike,
            'sparkles': Sparkles, 'map': Map, 'chef-hat': ChefHat, 'sun': Sun,
            'music': Music, 'home': Home, 'mountain': Mountain,
            'headphones': Headphones, 'shirt': Shirt, 'clock': Clock, 'phone': Phone,
            'archive': Archive, 'waves': Waves, 'activity': Activity, 'leaf': Leaf,
            'dumbbell': Dumbbell, 'zap': Zap, 'gift': Gift, 'party-popper': PartyPopper,
            'camera': Camera, 'flower': Flower
        };
        return iconMap[iconName?.toLowerCase()] || Check;
    };

    // Fetch package inclusions
    useEffect(() => {
        const fetchPackageInclusions = async () => {
            try {
                setInclusionsLoading(true);
                const response = await fetch(paths.buildApiUrl(`package-inclusions.php?action=list&package_id=${pkg.id}`));
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setPackageInclusions(data.inclusions || []);
                    }
                }
            } catch (error) {
                console.log('Package inclusions API not ready:', error);
            } finally {
                setInclusionsLoading(false);
            }
        };

        if (pkg.id) {
            fetchPackageInclusions();
        }
    }, [pkg.id]);

    // Helper function to safely parse inclusions data
    const parseInclusions = (data: any): string[] => {
        try {
            if (Array.isArray(data)) return data;
            if (typeof data === 'string' && data.trim().length > 0) {
                const parsed = JSON.parse(data);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (error) {
            return [];
        }
    };

    const inclusions = parseInclusions(pkg.inclusions || pkg.includes);
    const discountPercentage = parseFloat(pkg.discount_percentage);

    let basePrice = parseFloat(pkg.price || pkg.base_price || '0');

    if (basePrice === 0 && pkg.room_options && pkg.room_options.length > 0) {
        const roomPrices = pkg.room_options
            .map(room => parseFloat(String(room.price_override || 0)))
            .filter(price => price > 0);
        if (roomPrices.length > 0) basePrice = Math.min(...roomPrices);
    }

    if (basePrice === 0 && pkg.available_rooms && pkg.available_rooms.length > 0) {
        const roomPrices = pkg.available_rooms
            .map(room => parseFloat(String(room.final_price || 0)))
            .filter(price => price > 0);
        if (roomPrices.length > 0) basePrice = Math.min(...roomPrices);
    }

    const originalPrice = basePrice / (1 - discountPercentage / 100);

    const handleSelect = () => {
        if (onSelect) {
            onSelect(pkg.id);
        } else {
            let packageUrl = `/packages/${pkg.id}`;
            if (dateFilters) {
                packageUrl += `?checkin=${dateFilters.checkIn}&checkout=${dateFilters.checkOut}&guests=${dateFilters.adults + dateFilters.children}`;
            }
            navigate(packageUrl);
        }
    };

    const getPackageImageUrl = () => {
        if (pkg.images && Array.isArray(pkg.images) && pkg.images.length > 0) {
            return pkg.images[0];
        }
        if (pkg.image_url) return pkg.image_url;
        return '/images/ui/placeholder.svg';
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-300 flex flex-col h-full group ${className}`}>
            <div className="relative">
                <div className="aspect-video relative overflow-hidden">
                    <img
                        src={getPackageImageUrl()}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        fetchPriority='high'
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/ui/placeholder.svg';
                        }}
                    />

                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm">
                                <Tag className="h-3 w-3 mr-1" />
                                {pkg.discount_display}
                            </span>
                        </div>
                    )}

                    {/* Package Type Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-hotel-gold text-white shadow-sm">
                            {packageService.getPackageTypeDisplayName(pkg.type || pkg.package_type)}
                        </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg">
                        <span className="text-lg font-bold">${basePrice.toFixed(0)}</span>
                        <span className="text-[10px] opacity-70 ml-1">/ night</span>
                    </div>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-semibold mb-3 line-clamp-1 text-hotel-navy">{pkg.name}</h3>

                <p className="text-sm text-hotel-bronze mb-6 line-clamp-2 leading-relaxed">
                    {pkg.description}
                </p>

                {/* Package Details */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-hotel-bronze">
                        <Clock className="h-4 w-4 mr-3 text-hotel-gold" />
                        <span className="font-medium">{pkg.min_nights || 1}-{pkg.max_nights || 7} nights</span>
                    </div>

                    <div className="flex items-center text-sm text-hotel-bronze">
                        <Users className="h-4 w-4 mr-3 text-hotel-gold" />
                        <span className="font-medium">Up to {pkg.max_guests || 2} guests</span>
                    </div>
                </div>

                {/* Package Inclusions */}
                {!inclusionsLoading && packageInclusions.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold mb-3 flex items-center text-gray-900">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            What's Included:
                        </h4>
                        <div className="space-y-2">
                            {packageInclusions.slice(0, 4).map((inclusion) => {
                                const IconComponent = getInclusionIcon(inclusion.icon);
                                return (
                                    <div key={inclusion.inclusion_id} className="flex items-center text-sm text-gray-700">
                                        <IconComponent className="h-4 w-4 mr-3 text-green-600 flex-shrink-0" />
                                        <span className="line-clamp-1">{inclusion.name}</span>
                                    </div>
                                );
                            })}
                            {packageInclusions.length > 4 && (
                                <div className="text-sm text-gray-500 font-medium">
                                    +{packageInclusions.length - 4} more inclusions
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 mt-auto">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/packages/${pkg.id}`)}
                        className="flex-1 bg-white text-hotel-bronze border-hotel-gold px-4 py-2 rounded-lg hover:bg-hotel-cream transition-colors font-medium"
                    >
                        View Details
                    </Button>
                    <Button
                        onClick={handleSelect}
                        className="flex-1 bg-hotel-gold text-white px-4 py-2 rounded-lg hover:bg-hotel-gold-dark transition-colors font-medium shadow-lg"
                    >
                        Book Now
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PackageCard;
