import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
// User pages
import Index from "./pages/user/Index";
import { AdminGuard } from "@/components/AdminGuard";
import { BookingProvider } from "@/context/BookingContext";
import { GTMLoader } from "@/components/GTMLoader";

// Lazy load user pages
const BookingPage = lazy(() => import("./pages/user/Booking"));
const RoomDetails = lazy(() => import("./pages/user/RoomDetails"));
const PackagesPage = lazy(() => import("./pages/user/Packages"));
const PackageDetails = lazy(() => import("./pages/user/PackageDetails"));
const BookingSummary = lazy(() => import("./pages/user/BookingSummary"));
const ImageGalleryPage = lazy(() => import("./pages/user/ImageGalleryPage"));

// Lazy load admin pages
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));

// Lazy load shared pages
const NotFound = lazy(() => import("./pages/shared/NotFound"));

// Debug pages removed — P1-1 remediation 2026-05-18

// Loading component for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-samudra-gold"></div>
      <p className="text-samudra-ink">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BookingProvider>
      <TooltipProvider>
        <GTMLoader />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rooms/:roomId" element={<RoomDetails />} />
              <Route path="/book/:roomId" element={<BookingPage />} />
              <Route path="/book" element={<BookingPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/packages/:packageId" element={<PackageDetails />} />
              <Route path="/summary" element={<BookingSummary />} />
              <Route path="/confirmation/:bookingId" element={<BookingSummary />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <AdminGuard>
                  <AdminPanel />
                </AdminGuard>
              } />
              <Route path="/admin/*" element={
                <AdminGuard>
                  <AdminPanel />
                </AdminGuard>
              } />
              <Route path="/images" element={<ImageGalleryPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </BookingProvider>
  </QueryClientProvider>
);

export default App;