import React from 'react';
import { useVillaInfo } from '@/hooks/useVillaInfo';

const Footer = () => {
  const { villaInfo } = useVillaInfo();

  return (
    <footer className="bg-hotel-navy text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-hotel-cream text-sm">
            © {new Date().getFullYear()} {villaInfo?.name || 'Villa Daisy Cantik'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
