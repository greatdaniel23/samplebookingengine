/**
 * React Hooks for Cloudflare Worker API
 * Provides easy data fetching with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cloudflareApi, Booking, Amenity, User } from '@/services/cloudflareApi';

// ==================== BOOKINGS HOOKS ====================

export const useBookings = (limit = 50, offset = 0) => {
  return useQuery({
    queryKey: ['bookings', limit, offset],
    queryFn: () => cloudflareApi.getBookings(limit, offset),
    staleTime: 30 * 1000, // 30 seconds - keep fresh for admin
    retry: 2,
  });
};

export const useBooking = (id: number) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => cloudflareApi.getBooking(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

export const useBookingByReference = (reference: string) => {
  return useQuery({
    queryKey: ['booking', reference],
    queryFn: () => cloudflareApi.getBookingByReference(reference),
    enabled: !!reference,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Booking>) => cloudflareApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      paymentStatus,
    }: {
      id: number;
      status: string;
      paymentStatus?: string;
    }) => cloudflareApi.updateBookingStatus(id, status, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useSearchBookingsByDates = (checkInBefore: string, checkOutAfter: string) => {
  return useQuery({
    queryKey: ['bookings', 'dates', checkInBefore, checkOutAfter],
    queryFn: () => cloudflareApi.searchBookingsByDates(checkInBefore, checkOutAfter),
    enabled: !!checkInBefore && !!checkOutAfter,
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== AMENITIES HOOKS ====================

export const useAmenities = () => {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: () => cloudflareApi.getAmenities(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

export const useFeaturedAmenities = () => {
  return useQuery({
    queryKey: ['amenities', 'featured'],
    queryFn: () => cloudflareApi.getFeaturedAmenities(),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });
};

export const useAmenitiesByCategory = (category: string) => {
  return useQuery({
    queryKey: ['amenities', 'category', category],
    queryFn: () => cloudflareApi.getAmenitiesByCategory(category),
    enabled: !!category,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });
};

export const useAmenity = (id: number) => {
  return useQuery({
    queryKey: ['amenity', id],
    queryFn: () => cloudflareApi.getAmenity(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });
};

// ==================== AUTH HOOKS ====================

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      cloudflareApi.login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useVerifyToken = (token: string) => {
  return useQuery({
    queryKey: ['auth', 'verify', token],
    queryFn: () => cloudflareApi.verifyToken(token),
    enabled: !!token,
    retry: false,
  });
};

// ==================== ADMIN HOOKS ====================

export const useDashboard = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => cloudflareApi.getDashboard(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => cloudflareApi.getAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

// ==================== IMAGE HOOKS ====================

export const useImages = () => {
  return useQuery({
    queryKey: ['images'],
    queryFn: () => cloudflareApi.getImages(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, directory }: { file: File; directory?: string }) =>
      cloudflareApi.uploadImage(file, directory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => cloudflareApi.deleteImage(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};
