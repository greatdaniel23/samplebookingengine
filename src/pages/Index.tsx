import { PhotoGallery } from "@/components/PhotoGallery";
import { Amenities } from "@/components/Amenities";
import { Star } from "lucide-react";
import { RoomCard } from "@/components/RoomCard";
import { villaData } from "@/data/dummy";
import { useRooms } from "@/hooks/useRooms";
import IndexSkeleton from "@/components/IndexSkeleton";

const Index = () => {
  const { rooms, loading, error } = useRooms();

  if (loading) {
    return <IndexSkeleton />;
  }

  if (error) {
    return <div className="text-center py-10">Error: {error}</div>;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-4">
          <h1 className="text-4xl font-bold tracking-tight">{villaData.name}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
              <span>
                {villaData.rating} ({villaData.reviews} reviews)
              </span>
            </div>
            <span>·</span>
            <a href="#" className="underline hover:text-primary">{villaData.location}</a>
          </div>
        </header>

        <div className="my-8">
          <PhotoGallery images={villaData.images} />
        </div>

        <div className="my-16">
          <h2 className="text-3xl font-bold text-center mb-2">Select Your Room</h2>
          <p className="text-center text-muted-foreground mb-10">Choose from our selection of luxurious rooms and suites.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
        
        <div className="border-t my-16" />

        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3">
                  <h2 className="text-3xl font-bold mb-4">About this Villa</h2>
                  <p className="text-gray-700 leading-relaxed">
                      {villaData.description}
                  </p>
              </div>
              <div className="lg:col-span-2">
                <Amenities amenities={villaData.amenities} />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;