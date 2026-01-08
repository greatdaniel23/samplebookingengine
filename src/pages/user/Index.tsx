import { PhotoGallery } from "@/components/PhotoGallery";
import { Calendar } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { useIndexPageData } from "@/hooks/useIndexPageData";
import IndexSkeleton from "@/components/IndexSkeleton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { BookingSearchForm } from "@/components/BookingSearchForm";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import type { Package } from "@/types";
import { packageService } from "@/services/packageService";

// This page focuses on packages only - hero images + packages selection

const Index = () => {
  const navigate = useNavigate();

  // Get today's date for default filtering
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Date filtering state - default to today
  const [dateFilters, setDateFilters] = useState<{
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
  }>({
    checkIn: today.toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    checkOut: tomorrow.toISOString().split('T')[0], // Tomorrow's date
    adults: 2,
    children: 0
  });

  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);

  // Simplified data fetching - only packages and villa info needed
  const {
    safePackages,
    currentVillaData,
    isLoading,
    error
  } = useIndexPageData();

  // Auto-filter packages for today when component loads
  useEffect(() => {
    if (!isLoading && safePackages.length > 0) {
      handleBookingSearch({
        checkIn: dateFilters.checkIn,
        checkOut: dateFilters.checkOut,
        adults: dateFilters.adults,
        children: dateFilters.children
      });
    }
  }, [safePackages, isLoading]); // Run when packages are loaded

  const handleBookingSearch = async (searchData: any) => {
    // Filter packages in place instead of navigating
    setDateFilters({
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      adults: searchData.adults,
      children: searchData.children
    });

    try {
      setFilterLoading(true);

      // Get available packages for selected dates
      const apiFilters: any = {};
      if (searchData.checkIn) apiFilters.check_in = searchData.checkIn;
      if (searchData.checkOut) apiFilters.check_out = searchData.checkOut;

      const response = await packageService.getPackages(apiFilters);
      if (response.success) {
        // Filter by guest count
        const totalGuests = searchData.adults + (searchData.children || 0);
        const filtered = response.data.filter(pkg => pkg.max_guests >= totalGuests);
        setFilteredPackages(filtered);
      }
    } catch (err) {
      console.error('Error filtering packages:', err);
      setFilteredPackages([]);
    } finally {
      setFilterLoading(false);
    }
  };

  // FIXED Issue 3: Check error state FIRST to prevent hiding critical errors
  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-hotel-navy mb-4">Failed to load page content</h2>
        <p className="text-hotel-bronze mb-6">{error}</p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-hotel-sage text-white px-6 py-2 rounded hover:bg-hotel-sage-dark transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-hotel-bronze text-white px-6 py-2 rounded hover:bg-hotel-navy transition-colors"
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

  // Check if villa data is available from API
  if (!currentVillaData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-hotel-navy mb-4">Villa Information Not Available</h2>
        <p className="text-hotel-bronze mb-6">Unable to load villa data from API. Please check your connection.</p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-hotel-sage text-white px-6 py-2 rounded hover:bg-hotel-sage-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-hotel-cream min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Hotel Header - Shared Component */}
        <section className="mb-8">
          <Header />

          {/* Enhanced Photo Gallery Hero */}
          <div className="mb-8">
            <PhotoGallery images={currentVillaData.images} />
          </div>
        </section>

        {/* Booking Search Form - Under Hero */}
        <section className="mb-8">
          <BookingSearchForm onSearch={handleBookingSearch} />
        </section>

        {/* Packages Section */}
        <section className="my-20">
          <div className="text-center mb-12">
            <h2 className="section-title">
              Available Packages Offers
            </h2>
            <p className="body-large max-w-2xl mx-auto">
              Packages available for your selected dates
            </p>
          </div>

          {filterLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-hotel-bronze">Checking availability...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Show filtered packages */}
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <PackageCard key={pkg.id} package={pkg} dateFilters={dateFilters} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <h3 className="text-xl font-semibold text-hotel-navy mb-2">
                      No Available Packages
                    </h3>
                    <p className="text-hotel-bronze mb-4">
                      No packages are available for your selected dates. Try different dates or contact us directly.
                    </p>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const newFilters = {
                          checkIn: today.toISOString().split('T')[0],
                          checkOut: tomorrow.toISOString().split('T')[0],
                          adults: 2,
                          children: 0
                        };
                        setDateFilters(newFilters);
                        handleBookingSearch(newFilters);
                      }}
                      className="bg-hotel-sage text-white px-6 py-2 rounded hover:bg-hotel-sage-dark transition-colors"
                    >
                      Reset to Today
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default Index;