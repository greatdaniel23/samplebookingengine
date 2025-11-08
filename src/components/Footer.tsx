import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-hotel-navy text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-hotel-cream">
              <p>123 Luxury Avenue</p>
              <p>Aspen, Colorado</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Email: info@sereneretreat.com</p>
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
              <a href="#amenities" className="block text-hotel-cream hover:text-hotel-gold transition-colors">
                Amenities
              </a>
              <a href="#gallery" className="block text-hotel-cream hover:text-hotel-gold transition-colors">
                Gallery
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <p className="text-hotel-cream text-sm leading-relaxed">
              Experience unparalleled luxury and comfort at our prestigious mountain retreat. 
              Perfect for creating unforgettable memories in the heart of nature.
            </p>
            
            {/* Hidden Admin Link - only visible to those who know */}
            <div className="mt-6">
              <Link 
                to="/admin/login" 
                className="text-xs text-gray-500 hover:text-hotel-gold transition-colors opacity-30 hover:opacity-100"
                title="Staff Access"
              >
                Staff Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-hotel-cream text-sm">
            © 2024 Serene Mountain Retreat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;