import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BookingPage from "./pages/Booking";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import PackagesPage from "./pages/Packages";
import PackageDetails from "./pages/PackageDetails";
import BookingSummary from "./pages/BookingSummary";
import ImageGalleryPage from "./pages/ImageGalleryPage";
import DebugPackages from "./components/DebugPackages";
import ApiDebug from "./pages/ApiDebug";
import ComprehensiveDebug from "./components/ComprehensiveDebug";
import ApiUrlTester from "./components/ApiUrlTester";
import { AdminGuard } from "@/components/AdminGuard";
import { BookingProvider } from "@/context/BookingContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BookingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/book/:roomId" element={<BookingPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/packages/:packageId" element={<PackageDetails />} />
            <Route path="/summary" element={<BookingSummary />} />
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
            <Route path="/debug-packages" element={<DebugPackages />} />
            <Route path="/api-debug" element={<ApiDebug />} />
            <Route path="/env-debug" element={<ComprehensiveDebug />} />
            <Route path="/api-url-test" element={<ApiUrlTester />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </BookingProvider>
  </QueryClientProvider>
);

export default App;