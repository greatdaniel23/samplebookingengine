import { useState, useEffect } from 'react';
import { paths } from '@/config/paths';
import { apiClient } from '@/utils/apiClient';

export interface HomepageContent {
  // Hero Section — from homepage_settings table
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;

  // Basic Info
  name: string;
  location: string;
  description: string;
  rating: number;
  reviews: number;

  // Contact Information
  phone: string;
  email: string;
  website: string;

  // Address Details
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;

  // Property Specifications
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;

  // Timing
  checkIn: string;
  checkOut: string;

  // Policies
  cancellationPolicy: string;
  houseRules: string;
  termsConditions: string;

  // Social Media
  facebook: string;
  instagram: string;
  twitter: string;

  // Media
  images: string[];
  amenities: Array<{ name: string; icon: string }>;
}

interface UseHomepageContentResult {
  homepageContent: HomepageContent | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateHomepageContent: (data: Partial<HomepageContent>) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
}

export const useHomepageContent = (): UseHomepageContentResult => {
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageContent = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from homepage_settings (hero + social + policies)
      const hsUrl = paths.buildApiUrl('homepage-settings');
      const hsRes = await fetch(hsUrl, { headers: { Accept: 'application/json' } });
      if (!hsRes.ok) throw new Error(`homepage-settings HTTP ${hsRes.status}`);
      const hsResult = await hsRes.json();
      if (!hsResult.success) throw new Error(hsResult.error || 'Failed to fetch homepage settings');
      const hs = hsResult.data;

      // Also fetch villa_info for the basic property data that's maintained there
      const villaUrl = paths.buildApiUrl('villa');
      const villaRes = await fetch(villaUrl, { headers: { Accept: 'application/json' } });
      // villa data is best-effort; if it fails we fall back to homepage_settings values
      let villa: any = {};
      if (villaRes.ok) {
        const villaResult = await villaRes.json();
        if (villaResult.success && villaResult.data) villa = villaResult.data;
      }

      // Merge: homepage_settings is canonical for hero + social + policies
      // villa_info is canonical for basic contact + specs (until the two-table consolidation)
      const merged: HomepageContent = {
        // Hero — homepage_settings owns this
        hero_title: hs.hero_title || '',
        hero_subtitle: hs.hero_subtitle || '',
        hero_description: hs.hero_description || '',

        // Basic info — prefer homepage_settings, fall back to villa
        name: hs.property_name || villa.name || '',
        location: hs.property_location || villa.location || '',
        description: hs.property_description || villa.description || '',
        rating: hs.property_rating ?? villa.rating ?? 4.8,
        reviews: hs.property_reviews ?? villa.reviews ?? 0,

        // Contact — prefer homepage_settings columns, fall back to villa
        phone: hs.contact_phone || villa.phone || '',
        email: hs.contact_email || villa.email || '',
        website: hs.contact_website || villa.website || '',

        // Address
        address: hs.address_street || villa.address || '',
        city: hs.address_city || villa.city || '',
        state: hs.address_state || villa.state || '',
        country: hs.address_country || villa.country || '',
        zipcode: hs.address_zipcode || villa.zipCode || '',

        // Specs
        maxGuests: hs.spec_max_guests ?? villa.maxGuests ?? 8,
        bedrooms: hs.spec_bedrooms ?? villa.bedrooms ?? 4,
        bathrooms: hs.spec_bathrooms ?? villa.bathrooms ?? 3,
        basePrice: hs.spec_base_price ?? 0,

        // Timing
        checkIn: hs.timing_check_in || villa.checkInTime || '15:00',
        checkOut: hs.timing_check_out || villa.checkOutTime || '11:00',

        // Policies — homepage_settings owns this
        cancellationPolicy: hs.policy_cancellation || villa.cancellationPolicy || '',
        houseRules: hs.policy_house_rules || villa.houseRules || '',
        termsConditions: hs.policy_terms_conditions || '',

        // Social — homepage_settings owns this
        facebook: hs.social_facebook || '',
        instagram: hs.social_instagram || '',
        twitter: hs.social_twitter || '',

        // Media
        images: (() => {
          try { return JSON.parse(hs.images_json || '[]'); } catch { return []; }
        })(),
        amenities: Array.isArray(villa.amenities) ? villa.amenities : [],
      };

      setHomepageContent(merged);
    } catch (err) {
      console.error('Homepage content fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch homepage content');
      setHomepageContent(null);
    } finally {
      setLoading(false);
    }
  };

  const updateHomepageContent = async (data: Partial<HomepageContent>) => {
    try {
      // Write hero + social + policies to homepage_settings
      const hsPayload: Record<string, any> = {};
      if (data.hero_title !== undefined) hsPayload.hero_title = data.hero_title;
      if (data.hero_subtitle !== undefined) hsPayload.hero_subtitle = data.hero_subtitle;
      if (data.hero_description !== undefined) hsPayload.hero_description = data.hero_description;
      if (data.name !== undefined) hsPayload.property_name = data.name;
      if (data.location !== undefined) hsPayload.property_location = data.location;
      if (data.description !== undefined) hsPayload.property_description = data.description;
      if (data.phone !== undefined) hsPayload.contact_phone = data.phone;
      if (data.email !== undefined) hsPayload.contact_email = data.email;
      if (data.website !== undefined) hsPayload.contact_website = data.website;
      if (data.address !== undefined) hsPayload.address_street = data.address;
      if (data.city !== undefined) hsPayload.address_city = data.city;
      if (data.state !== undefined) hsPayload.address_state = data.state;
      if (data.country !== undefined) hsPayload.address_country = data.country;
      if (data.zipcode !== undefined) hsPayload.address_zipcode = data.zipcode;
      if (data.maxGuests !== undefined) hsPayload.spec_max_guests = data.maxGuests;
      if (data.bedrooms !== undefined) hsPayload.spec_bedrooms = data.bedrooms;
      if (data.bathrooms !== undefined) hsPayload.spec_bathrooms = data.bathrooms;
      if (data.basePrice !== undefined) hsPayload.spec_base_price = data.basePrice;
      if (data.checkIn !== undefined) hsPayload.timing_check_in = data.checkIn;
      if (data.checkOut !== undefined) hsPayload.timing_check_out = data.checkOut;
      if (data.cancellationPolicy !== undefined) hsPayload.policy_cancellation = data.cancellationPolicy;
      if (data.houseRules !== undefined) hsPayload.policy_house_rules = data.houseRules;
      if (data.termsConditions !== undefined) hsPayload.policy_terms_conditions = data.termsConditions;
      if (data.facebook !== undefined) hsPayload.social_facebook = data.facebook;
      if (data.instagram !== undefined) hsPayload.social_instagram = data.instagram;
      if (data.twitter !== undefined) hsPayload.social_twitter = data.twitter;
      if (data.images !== undefined) hsPayload.images_json = JSON.stringify(data.images);

      if (Object.keys(hsPayload).length > 0) {
        // Direct Worker URL + auth (homepage-settings has no Pages-Function proxy)
        const result = await apiClient.put<any>('/api/homepage-settings', hsPayload);
        if (!result.success) throw new Error(result.error || 'Update failed');
      }

      // Also mirror basic villa info to villa_info table for public site rendering
      const villaPayload: Record<string, any> = {};
      if (data.name !== undefined) villaPayload.name = data.name;
      if (data.description !== undefined) villaPayload.description = data.description;
      if (data.phone !== undefined) villaPayload.phone = data.phone;
      if (data.email !== undefined) villaPayload.email = data.email;
      if (data.website !== undefined) villaPayload.website = data.website;
      if (data.address !== undefined) villaPayload.address = data.address;
      if (data.maxGuests !== undefined) villaPayload.max_guests = data.maxGuests;
      if (data.bedrooms !== undefined) villaPayload.total_rooms = data.bedrooms;
      if (data.bathrooms !== undefined) villaPayload.total_bathrooms = data.bathrooms;
      if (data.checkIn !== undefined) villaPayload.check_in_time = data.checkIn;
      if (data.checkOut !== undefined) villaPayload.check_out_time = data.checkOut;
      if (data.cancellationPolicy !== undefined) villaPayload.cancellationPolicy = data.cancellationPolicy;
      if (data.houseRules !== undefined) villaPayload.houseRules = data.houseRules;

      if (Object.keys(villaPayload).length > 0) {
        // Best effort — ignore villa write errors since homepage_settings is now canonical
        apiClient.put('/api/villa', villaPayload).catch(() => {});
      }

      await fetchHomepageContent();
      return { success: true, message: 'Homepage content updated successfully' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update homepage content';
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  return { homepageContent, loading, error, refetch: fetchHomepageContent, updateHomepageContent };
};
