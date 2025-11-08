"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";
import { useNavigate } from "react-router-dom";

interface RoomCardProps {
  room: Room;
}

export const RoomCard = ({ room }: RoomCardProps) => {
  const navigate = useNavigate();

  const handleBook = () => {
    navigate(`/book/${room.id}`);
  };

  return (
    <Card className="overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <img src={room.image_url} alt={room.name} className="w-full h-56 object-cover" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-2">{room.name}</CardTitle>
        <p className="text-sm text-muted-foreground h-20">{room.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-2 flex justify-between items-center bg-slate-50">
        <div>
          <p className="text-xl font-bold">${room.price}</p>
          <p className="text-xs text-muted-foreground">/ night</p>
        </div>
        <Button onClick={handleBook} size="lg">Book Now</Button>
      </CardFooter>
    </Card>
  );
};