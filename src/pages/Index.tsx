import { PhotoGallery } from "@/components/PhotoGallery";
import { Amenities } from "@/components/Amenities";
import { Star } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { villaData } from "@/data/dummy";
import { usePackages } from "@/hooks/usePackages";
import { useVillaInfo } from "@/hooks/useVillaInfo";
import IndexSkeleton from "@/components/IndexSkeleton";
import Footer from "@/components/Footer";
import type { Villa } from "@/types";

const Index = () => {
  const { packages, loading: packagesLoading, error: packagesError } = usePackages();
  const { villaInfo, loading: villaLoading, error: villaError, refetch } = useVillaInfo();

  // Normalize villa data to ensure compatibility between VillaInfo and Villa types
  const normalizeVillaData = (data: any): Villa => {
    if (!data) return villaData;
    
    return {
      id: data.id || villaData.id,
      name: data.name || villaData.name,
      location: data.location || villaData.location,
      description: data.description || villaData.description,
      rating: data.rating || villaData.rating,
      reviews: data.reviews || villaData.reviews,
      images: data.images || villaData.images,
      amenities: data.amenities || villaData.amenities,
      rooms: data.rooms || villaData.rooms, // VillaInfo doesn't have rooms, so use static data rooms
    };
  };

  // Use dynamic villa info if available, fallback to static data
  const currentVillaData = normalizeVillaData(villaInfo);

  // Use dynamic villa info with proper fallback handling

  if (packagesLoading || villaLoading) {
    return <IndexSkeleton />;
  }

  if (packagesError) {
    return <div className="text-center py-10">Error loading packages: {packagesError}</div>;
  }
  
  // For villa info errors, we just use fallback data and continue
  if (villaError) {
    console.warn('Villa info API error, using fallback data:', villaError);
  }

  return (
    <div className="bg-gradient-to-br from-white to-hotel-cream min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-hotel-navy">{currentVillaData.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-hotel-bronze mt-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-hotel-gold fill-current mr-1" />
              <span>
                {currentVillaData.rating} ({currentVillaData.reviews} reviews)
              </span>
            </div>
            <span>·</span>
            <a href="#" className="underline hover:text-hotel-gold transition-colors">{currentVillaData.location}</a>
          </div>

        </header>

        <div className="my-8">
          <PhotoGallery images={currentVillaData.images} />
        </div>

        <div className="my-16">
          <h2 className="text-3xl font-bold text-center mb-2 text-hotel-navy">Select Your Package</h2>
          <p className="text-center text-hotel-bronze mb-10">Choose from our selection of exclusive packages with special pricing and premium amenities.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(packages) ? packages.slice(0, 6).map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            )) : (
              <div className="col-span-full text-center py-8">
                <p>No packages available at the moment.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t my-16" />

        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3">
                  <h2 className="text-3xl font-bold mb-4">About this Villa</h2>
                  <p className="text-gray-700 leading-relaxed">
                      {currentVillaData.description}
                  </p>
              </div>
              <div className="lg:col-span-2">
                <Amenities amenities={currentVillaData.amenities} />
              </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;