"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";
import { useNavigate } from "react-router-dom";
import { getRoomImages, getImageProps } from "@/utils/images";

interface RoomCardProps {
  room: Room;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  const navigate = useNavigate();
  
  // Get room images - use room.id for image folder structure
  const roomImages = getRoomImages(room.id);
  
  // Fallback to API image_url if exists, otherwise use our structured images
  const imageUrl = room.image_url || roomImages.main;
  const imageProps = getImageProps(imageUrl, room.name);

  const handleBook = () => {
    navigate(`/book/${room.id}`);
  };

  const handleViewDetails = () => {
    navigate(`/rooms/${room.id}`);
  };

  return (
    <Card className="overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <img 
          {...imageProps}
          className="w-full h-56 object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/images/ui/placeholder.jpg';
          }}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-2">{room.name}</CardTitle>
        <p className="text-sm text-muted-foreground h-20">{room.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-2 bg-slate-50">
        <div className="flex justify-between items-center w-full mb-3">
          <div>
            <p className="text-xl font-bold">${room.price}</p>
            <p className="text-xs text-muted-foreground">/ night</p>
          </div>
          <Button onClick={handleViewDetails} variant="outline" size="sm">
            View Details
          </Button>
        </div>
        <Button onClick={handleBook} size="lg" className="w-full">
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};