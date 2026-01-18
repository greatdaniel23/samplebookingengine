import { Star, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVillaInfo } from '@/hooks/useVillaInfo';
import { getImageUrl } from '@/config/r2';

interface HeaderProps {
    showGallery?: boolean;
    className?: string;
}

export const Header = ({ showGallery = false, className = '' }: HeaderProps) => {
    const navigate = useNavigate();
    const { villaInfo, loading } = useVillaInfo();

    // Default villa data if API is loading or fails
    const defaultVilla = {
        name: 'Rumah Daisy Cantik',
        address: '',
        city: 'Bandung',
        state: 'West Java',
        country: 'Indonesia',
        phone: '',
        rating: 4.8,
        reviews: 120,
        images: [],
        logo_url: '',
        website: ''
    };

    const villa = villaInfo || defaultVilla;

    const getFullAddress = () => {
        const parts = [];
        if (villa.address) parts.push(villa.address);
        if (villa.city) parts.push(villa.city);
        if (villa.state) parts.push(villa.state);
        if (villa.country) parts.push(villa.country);
        return parts.join(', ') || 'Indonesia';
    };

    // Get logo URL with conversion for mobile compatibility
    const logoUrl = villa.logo_url ? getImageUrl(villa.logo_url) : '/logo.png';

    return (
        <header className={`mb-4 md:mb-8 ${className}`}>
            <div className="max-w-6xl mx-auto">
                {/* Mobile: Logo + Main Info side by side | Desktop: Same but larger */}
                <div className="flex items-center gap-3 md:gap-6">
                    {/* Logo - Clickable to go to main site */}
                    <a href={villa.website || "/"} target={villa.website ? "_blank" : "_self"} rel="noopener noreferrer" className="flex-shrink-0">
                        <img
                            src={logoUrl}
                            alt={`${villa.name} Logo`}
                            className="h-14 w-14 md:h-20 md:w-auto object-contain cursor-pointer rounded-lg"
                        />
                    </a>

                    {/* Villa Info - Next to logo on mobile */}
                    <div className="flex-1 min-w-0">
                        {/* Villa Name */}
                        <h3
                            className="text-base md:text-2xl font-semibold text-hotel-charcoal mb-1 cursor-pointer hover:text-hotel-primary transition-colors truncate"
                            onClick={() => navigate('/')}
                        >
                            {villa.name}
                        </h3>

                        {/* Desktop: Location and Rating inline | Mobile: Stacked */}
                        <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                            {/* Location */}
                            <div className="flex items-center text-xs md:text-sm text-hotel-bronze mb-1 md:mb-0">
                                <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
                                {/* Mobile: City, Country */}
                                <span className="truncate md:hidden">{villa.city}, {villa.country}</span>
                                {/* Desktop: Full Address */}
                                <span className="hidden md:inline truncate">{getFullAddress()}</span>
                            </div>

                            {/* Rating Stars */}
                            <div className="flex items-center gap-1">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-3 h-3 md:w-4 md:h-4 ${star <= Math.floor(villa.rating) ? 'text-hotel-gold fill-current' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs md:text-sm font-medium text-hotel-charcoal ml-1">{villa.rating}</span>
                                <span className="text-xs text-hotel-bronze">({villa.reviews})</span>
                            </div>
                        </div>
                    </div>

                    {/* Phone - Only on Desktop */}
                    {villa.phone && (
                        <a
                            href={`tel:${villa.phone}`}
                            className="hidden md:flex items-center text-sm text-hotel-bronze hover:text-hotel-primary transition-colors"
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{villa.phone}</span>
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

