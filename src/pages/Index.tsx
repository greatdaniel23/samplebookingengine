import { PhotoGallery } from "@/components/PhotoGallery";
import { Star } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { useIndexPageData } from "@/hooks/useIndexPageData";
import IndexSkeleton from "@/components/IndexSkeleton";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import type { Package } from "@/types";

// This page focuses on packages only - hero images + packages selection

const Index = () => {
  const navigate = useNavigate();
  
  // Simplified data fetching - only packages and villa info needed
  const { 
    safePackages, 
    currentVillaData, 
    isLoading, 
    error 
  } = useIndexPageData();

  // Display all packages (no limit for dedicated packages page)
  const displayPackages = useMemo(() => safePackages, [safePackages]);

  // FIXED Issue 3: Check error state FIRST to prevent hiding critical errors
  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to load page content</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="space-x-4">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-hotel-sage text-white px-6 py-2 rounded hover:bg-hotel-sage-dark transition-colors"
          >
            Retry
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Only show loading after confirming no errors exist
  if (isLoading) {
    return <IndexSkeleton />;
  }

  return (
    <div className="bg-gradient-to-br from-white to-hotel-cream min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Villa Info and Photo Gallery */}
        <section className="mb-12">
          <header className="mb-8 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-hotel-navy mb-4">{currentVillaData.name}</h1>
            <div className="flex items-center justify-center space-x-4 text-lg text-hotel-bronze">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-hotel-gold fill-current mr-2" />
                <span>
                  {currentVillaData.rating} ({currentVillaData.reviews} reviews)
                </span>
              </div>
              <span>·</span>
              <a href="#" className="underline hover:text-hotel-gold transition-colors">{currentVillaData.location}</a>
            </div>
          </header>

          {/* Enhanced Photo Gallery Hero */}
          <div className="mb-8">
            <PhotoGallery images={currentVillaData.images} />
          </div>
        </section>

        {/* Packages Section */}
        <section className="my-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-hotel-navy">Select Your Perfect Package</h2>
            <p className="text-xl text-hotel-bronze max-w-3xl mx-auto">
              Choose from our collection of carefully curated packages, each designed to create unforgettable experiences 
              with exclusive amenities and special pricing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPackages.length > 0 ? displayPackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            )) : (
              <div className="col-span-full text-center py-12">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-hotel-navy mb-2">No Packages Available</h3>
                  <p className="text-hotel-bronze">We're currently updating our package offerings. Please check back soon!</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Index;