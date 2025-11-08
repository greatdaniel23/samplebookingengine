import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { Booking, BookingContextValue } from "@/types";
// @ts-ignore
import ApiService from "@/services/api.js";

const STORAGE_KEY = "bookings";

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

const loadInitial = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>(() => loadInitial());
  const [dbBookings, setDbBookings] = useState<Booking[]>([]);

  // Load bookings from database on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await ApiService.getBookings();
        if (Array.isArray(data)) {
          // Transform database bookings to match frontend format
          const transformedBookings: Booking[] = data.map((dbBooking: any) => ({
            id: dbBooking.id,
            reference: dbBooking.reference || `BK-${dbBooking.id}`,
            roomId: dbBooking.room_id,
            from: dbBooking.check_in,
            to: dbBooking.check_out,
            guests: dbBooking.guests,
            user: {
              firstName: dbBooking.first_name,
              lastName: dbBooking.last_name,
              email: dbBooking.email,
              phone: dbBooking.phone || ''
            },
            total: parseFloat(dbBooking.total_amount),
            createdAt: dbBooking.created_at
          }));
          setDbBookings(transformedBookings);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // ignore persistence errors
    }
  }, [bookings]);

  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [...prev, booking]);
  }, []);

  const getBookingsForRoom = useCallback(
    (roomId: string) => {
      // Combine both localStorage bookings and database bookings
      const allBookings = [...bookings, ...dbBookings];
      return allBookings.filter((b) => b.roomId === roomId);
    },
    [bookings, dbBookings],
  );

  const clearAllBookings = useCallback(() => setBookings([]), []);

  const value: BookingContextValue = {
    bookings: [...bookings, ...dbBookings], // Combine all bookings
    addBooking,
    getBookingsForRoom,
    clearAllBookings,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBookings = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within BookingProvider");
  return ctx;
};
