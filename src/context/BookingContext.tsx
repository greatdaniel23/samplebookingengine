import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { Booking, BookingContextValue } from "@/types";

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
    (roomId: string) => bookings.filter((b) => b.roomId === roomId),
    [bookings],
  );

  const clearAllBookings = useCallback(() => setBookings([]), []);

  const value: BookingContextValue = {
    bookings,
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
