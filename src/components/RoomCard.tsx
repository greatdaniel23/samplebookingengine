"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Room } from "@/types";

interface RoomCardProps {
  room: Room;
  onBook: (room: Room) => void;
}

export const RoomCard = ({ room, onBook }: RoomCardProps) => {
  return (
    <Card className="overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0">
        <img src={room.image} alt={room.name} className="w-full h-56 object-cover" />
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
        <Button onClick={() => onBook(room)} size="lg">Book Now</Button>
      </CardFooter>
    </Card>
  );
};