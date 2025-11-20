import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { Room } from '@/types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await ApiService.getRooms();
         // Debug log
        if (Array.isArray(data)) {
          setRooms(data);
        } else {
          console.error('Rooms data is not an array:', data);
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error('Error in fetchRooms:', err);
        setError('Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return { rooms, loading, error };
};
