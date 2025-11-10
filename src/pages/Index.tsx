import { PhotoGallery } from "@/components/PhotoGallery";
import { Amenities } from "@/components/Amenities";
import { RoomsSection } from "@/components/RoomsSection";
import { AboutSection } from "@/components/AboutSection";
import { Star } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { useIndexPageData } from "@/hooks/useIndexPageData";
import { useRoomFiltering } from "@/hooks/useRoomFiltering";
import { useDescriptionProcessor } from "@/hooks/useDescriptionProcessor";
import IndexSkeleton from "@/components/IndexSkeleton";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import type { Package } from "@/types";

// Constants
const DESCRIPTION_MAX_LENGTH = 300; // Maximum characters to show before truncation
const MAX_PACKAGES_DISPLAY = 6; // Maximum number of packages to display on homepage

const Index = () => {
  const navigate = useNavigate();
  
  // FIXED Issue 2: Separated data fetching concerns
  const { 
    safeRooms, 
    safePackages, 
    currentVillaData, 
    isLoading, 
    error 
  } = useIndexPageData();

  // FIXED Issue 2: Separated room filtering concerns
  const {
    activeRoomTab,
    setActiveRoomTab,
    roomTypes,
    filteredRooms
  } = useRoomFiltering(safeRooms);

  // FIXED Issue 1: Separated description processing concerns
  const processedDescription = useDescriptionProcessor(currentVillaData?.description);

  // Display limited packages with proper error handling
  const displayPackages = useMemo(() => safePackages.slice(0, MAX_PACKAGES_DISPLAY), [safePackages]);

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
            {displayPackages.length > 0 ? displayPackages.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} />
            )) : (
              <div className="col-span-full text-center py-8">
                <p>No packages available at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* FIXED Issue 2: Separated Rooms Section Component */}
        <RoomsSection
          rooms={safeRooms}
          roomTypes={roomTypes}
          activeRoomTab={activeRoomTab}
          onTabChange={setActiveRoomTab}
          filteredRooms={filteredRooms}
        />
        
        <div className="border-t my-16" />

        {/* FIXED Issue 2: Separated About Section Component */}
        <AboutSection
          villaName={currentVillaData.name}
          processedDescription={processedDescription}
          amenities={currentVillaData.amenities}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Index;