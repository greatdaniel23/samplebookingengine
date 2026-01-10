import { useState, useEffect } from 'react';
import { paths } from '../config/paths';
import { Room } from '@/types';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(paths.buildApiUrl('rooms'));
        if (!response.ok) throw new Error('Failed to fetch rooms');
        const result = await response.json();
        const data = result.success ? result.data : result;
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
