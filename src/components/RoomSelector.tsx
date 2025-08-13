"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Room {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string | undefined;
  onSelectRoom: (roomId: string) => void;
}

export const RoomSelector = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
}: RoomSelectorProps) => {
  return (
    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
      {rooms.map((room) => (
        <Card
          key={room.id}
          onClick={() => onSelectRoom(room.id)}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            selectedRoomId === room.id && "ring-2 ring-primary shadow-md"
          )}
        >
          <CardContent className="p-3 flex items-center gap-3">
            <img
              src={room.image}
              alt={room.name}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="flex-grow">
              <h4 className="font-semibold text-sm">{room.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {room.description}
              </p>
              <p className="text-base font-bold mt-1">
                ${room.price}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  / night
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};