import { Star, MapPin, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVillaInfo } from '@/hooks/useVillaInfo';

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
        images: []
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

    return (
        <header className={`mb-8 ${className}`}>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-6">
                {/* Logo - Clickable to go to main site */}
                <a href="https://rumahdaisycantik.com" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <img
                        src="https://bookingengine-8g1-boe-kxn.pages.dev/logo.png"
                        alt="Rumah Daisy Cantik Logo"
                        className="h-16 w-auto md:h-20 object-contain cursor-pointer"
                    />
                </a>

                {/* Villa Info */}
                <div className="flex-1">
                    <h3
                        className="text-xl md:text-2xl font-medium text-hotel-charcoal mb-3 cursor-pointer hover:text-hotel-primary transition-colors"
                        onClick={() => navigate('/')}
                    >
                        {villa.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-hotel-bronze">
                        {/* Location with Address */}
                        <a href="#" className="flex items-center hover:text-hotel-primary transition-colors">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{getFullAddress()}</span>
                        </a>

                        {/* Phone */}
                        {villa.phone && (
                            <a href={`tel:${villa.phone}`} className="flex items-center hover:text-hotel-primary transition-colors">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{villa.phone}</span>
                            </a>
                        )}

                        {/* Rating */}
                        <div className="flex items-center">
                            <Star className="w-4 h-4 text-hotel-gold fill-current mr-1" />
                            <span className="font-medium">{villa.rating}</span>
                            <span className="ml-1">({villa.reviews} ulasan)</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
