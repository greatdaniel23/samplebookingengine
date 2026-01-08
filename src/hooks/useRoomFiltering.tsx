import { useMemo, useState } from 'react';
import type { Room } from "@/types";

/**
 * Custom hook to manage room filtering logic
 * Separates filtering concerns from the main component
 */
export const useRoomFiltering = (rooms: Room[]) => {
  const [activeRoomTab, setActiveRoomTab] = useState('all');

  // Dynamic room type extraction from API data
  const roomTypes = useMemo(() => {
    const types = new Set<string>();
    rooms.forEach(room => {
      if (room.type && typeof room.type === 'string') {
        types.add(room.type.toLowerCase());
      }
    });
    return ['all', ...Array.from(types)];
  }, [rooms]);

  // Filtered rooms based on active tab
  const filteredRooms = useMemo(() => {
    if (activeRoomTab === 'all') {
      return rooms;
    }
    return rooms.filter(room => 
      room.type && room.type.toLowerCase() === activeRoomTab
    );
  }, [rooms, activeRoomTab]);

  return {
    activeRoomTab,
    setActiveRoomTab,
    roomTypes,
    filteredRooms,
  };
};