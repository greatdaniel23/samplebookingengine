import React from 'react';
import { Link } from 'react-router-dom';
import { useVillaInfo } from '@/hooks/useVillaInfo';

const Footer = () => {
  const { villaInfo, loading, refetch } = useVillaInfo();
  
  // Debug: Log current villa info
  
  
  
  // Debug function to force refresh
  const handleRefresh = () => {
    
    refetch?.();
  };

  // Create address display with fallback
  const getAddress = () => {
    if (!villaInfo) return "Jl. Pantai Indah No. 123";
    return villaInfo.address || "Jl. Pantai Indah No. 123";
  };

  const getLocation = () => {
    if (!villaInfo) return "Bali, Indonesia";
    
    // Use city, state, country if available, otherwise use location field
    if (villaInfo.city && villaInfo.state && villaInfo.country) {
      return `${villaInfo.city}, ${villaInfo.state}, ${villaInfo.country}`;
    } else if (villaInfo.city && villaInfo.country) {
      return `${villaInfo.city}, ${villaInfo.country}`;
    } else if (villaInfo.location) {
      return villaInfo.location;
    }
    return "Bali, Indonesia";
  };

  const getPhone = () => {
    if (!villaInfo) return "+62 361 123456";
    return villaInfo.phone || "+62 361 123456";
  };

  const getEmail = () => {
    if (!villaInfo) return "info@villadaisycantik.com";
    return villaInfo.email || "info@villadaisycantik.com";
  };

  return (
    <footer className="bg-hotel-navy text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-hotel-cream">
              <p>{getAddress()}</p>
              <p>{getLocation()}</p>
              <p>Phone: {getPhone()}</p>
              <p>Email: {getEmail()}</p>
              {/* Debug refresh button */}
              
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-hotel-cream hover:text-hotel-gold transition-colors">
                Home
              </Link>
              <Link to="/packages" className="block text-hotel-cream hover:text-hotel-gold transition-colors">
                Packages
              </Link>
              
              <a href="#gallery" className="block text-hotel-cream hover:text-hotel-gold transition-colors">
                Gallery
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-hotel-cream text-sm leading-relaxed">
              {villaInfo?.description || 'Experience unparalleled luxury and comfort at our prestigious retreat. Perfect for creating unforgettable memories.'}
            </p>
            
            
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-hotel-cream text-sm">
            © {new Date().getFullYear()} {villaInfo?.name || 'Villa Daisy Cantik'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
