import { BookingWidget } from "@/components/BookingWidget";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Star } from "lucide-react";

const villaData = {
  name: "Serene Mountain Villa",
  location: "Aspen, Colorado",
  description:
    "Escape to this beautiful villa nestled in the mountains. With breathtaking views and luxurious amenities, it's the perfect destination for a family getaway or a romantic retreat. Enjoy the private hot tub, cozy fireplace, and fully-equipped kitchen.",
  pricePerNight: 450,
  rating: 4.9,
  reviews: 120,
  rooms: [
    { id: "standard", name: "Standard Room" },
    { id: "deluxe", name: "Deluxe Suite" },
    { id: "penthouse", name: "Penthouse" },
  ],
  images: [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ],
};

const Index = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">{villaData.name}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            <span>
              {villaData.rating} ({villaData.reviews} reviews)
            </span>
          </div>
          <span>·</span>
          <span className="underline cursor-pointer">{villaData.location}</span>
        </div>
      </header>

      <div className="mb-8">
        <PhotoGallery images={villaData.images} />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-x-24 gap-y-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-2">About this villa</h2>
          <p className="text-gray-700 leading-relaxed">
            {villaData.description}
          </p>
        </div>
        <aside className="lg:col-span-1">
          <div className="sticky top-8">
            <BookingWidget pricePerNight={villaData.pricePerNight} rooms={villaData.rooms} />
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Index;