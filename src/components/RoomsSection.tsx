import React from 'react';
import { useNavigate } from "react-router-dom";
import type { Room } from "@/types";

interface RoomsSectionProps {
  rooms: Room[];
  roomTypes: string[];
  activeRoomTab: string;
  onTabChange: (tab: string) => void;
  filteredRooms: Room[];
}

/**
 * Separated Rooms section component
 * Handles room display and filtering UI
 */
export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms,
  roomTypes,
  activeRoomTab,
  onTabChange,
  filteredRooms
}) => {
  const navigate = useNavigate();

  if (rooms.length === 0) {
    return null;
  }

  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-2 text-hotel-navy">Our Rooms</h2>
      <p className="text-center text-hotel-bronze mb-8">Choose from our selection of carefully designed accommodations.</p>
      
      {/* Dynamic Room Type Tabs */}
      {roomTypes.length > 1 && (
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-gray-100 rounded-lg p-1">
            {roomTypes.map((type) => (
              <button
                key={type}
                onClick={() => onTabChange(type)}
                className={`px-4 py-2 rounded-md capitalize transition-colors ${
                  activeRoomTab === type
                    ? 'bg-hotel-sage text-white'
                    : 'text-gray-600 hover:text-hotel-sage'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtered Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={room.image_url} 
              alt={room.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
              <p className="text-gray-600 mb-3">{room.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-hotel-sage font-bold">${room.price}/night</span>
                <button 
                  onClick={() => navigate(`/booking/${room.id}`)}
                  className="bg-hotel-sage text-white px-4 py-2 rounded hover:bg-hotel-sage-dark transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};