import { useState, useEffect } from 'react';
import { paths } from '@/config/paths';

export interface HomepageContent {
  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  
  // Basic Info (compatible with existing villa info structure)
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
  
  // Timing Information
  checkIn: string;
  checkOut: string;
  
  // Property Policies
  cancellationPolicy: string;
  houseRules: string;
  termsConditions: string;
  
  // Social Media Links
  facebook: string;
  instagram: string;
  twitter: string;
  
  // Media Content
  images: string[];
  amenities: Array<{
    name: string;
    icon: string;
  }>;
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
      
      const apiUrl = paths.buildApiUrl('/homepage.php');
      
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      
      if (result.success && result.data) {
        // Transform API response to match frontend interface
        const transformedData: HomepageContent = {
          // Hero section
          hero_title: result.data.hero_title || 'Serene Mountain Retreat',
          hero_subtitle: result.data.hero_subtitle || 'Luxury Villa Experience',
          hero_description: result.data.hero_description || 'Experience unparalleled luxury and comfort',
          
          // Map database fields to existing villa info structure for compatibility
          name: result.data.property_name || 'Serene Mountain Retreat',
          location: result.data.property_location || 'Aspen, Colorado',
          description: result.data.property_description || '',
          rating: parseFloat(result.data.property_rating) || 4.8,
          reviews: parseInt(result.data.property_reviews) || 127,
          
          // Contact information
          phone: result.data.contact_phone || '+1 (555) 123-4567',
          email: result.data.contact_email || 'info@sereneretreat.com',
          website: result.data.contact_website || '',
          
          // Address details
          address: result.data.address_street || '123 Luxury Avenue',
          city: result.data.address_city || 'Aspen',
          state: result.data.address_state || 'Colorado',
          country: result.data.address_country || 'United States',
          zipcode: result.data.address_zipcode || '',
          
          // Property specifications
          maxGuests: parseInt(result.data.spec_max_guests) || 8,
          bedrooms: parseInt(result.data.spec_bedrooms) || 4,
          bathrooms: parseInt(result.data.spec_bathrooms) || 3,
          basePrice: parseFloat(result.data.spec_base_price) || 350,
          
          // Timing
          checkIn: result.data.timing_check_in || '3:00 PM',
          checkOut: result.data.timing_check_out || '11:00 AM',
          
          // Policies
          cancellationPolicy: result.data.policy_cancellation || '',
          houseRules: result.data.policy_house_rules || '',
          termsConditions: result.data.policy_terms_conditions || '',
          
          // Social media
          facebook: result.data.social_facebook || '',
          instagram: result.data.social_instagram || '',
          twitter: result.data.social_twitter || '',
          
          // Media content
          images: Array.isArray(result.data.images) ? result.data.images : [],
          amenities: Array.isArray(result.data.amenities) ? result.data.amenities : []
        };
        
        
        setHomepageContent(transformedData);
        
      } else {
        throw new Error(result.message || 'Failed to fetch homepage content');
      }
    } catch (err) {
      console.error('🚨 Homepage content fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch homepage content';
      setError(errorMessage);
      
      // Set fallback data to prevent app from breaking
      setHomepageContent({
        hero_title: 'Serene Mountain Retreat',
        hero_subtitle: 'Luxury Villa Experience',
        hero_description: 'Experience unparalleled luxury and comfort',
        name: 'Serene Mountain Retreat',
        location: 'Aspen, Colorado',
        description: 'Escape to this stunning mountain retreat where modern luxury meets rustic charm.',
        rating: 4.8,
        reviews: 127,
        phone: '+1 (555) 123-4567',
        email: 'info@sereneretreat.com',
        website: '',
        address: '123 Luxury Avenue',
        city: 'Aspen',
        state: 'Colorado',
        country: 'United States',
        zipcode: '',
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        basePrice: 350,
        checkIn: '3:00 PM',
        checkOut: '11:00 AM',
        cancellationPolicy: '',
        houseRules: '',
        termsConditions: '',
        facebook: '',
        instagram: '',
        twitter: '',
        images: [],
        amenities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const updateHomepageContent = async (data: Partial<HomepageContent>) => {
    try {
      const apiUrl = paths.buildApiUrl('/homepage.php');
      
      
      
      // Transform frontend data to API format
      const apiData = {
        // Hero section
        heroTitle: data.hero_title || data.name,
        heroSubtitle: data.hero_subtitle,
        heroDescription: data.hero_description || data.description,
        
        // Basic info
        name: data.name,
        location: data.location,
        description: data.description,
        rating: data.rating,
        reviews: data.reviews,
        
        // Contact
        phone: data.phone,
        email: data.email,
        website: data.website,
        
        // Address
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipcode: data.zipcode,
        
        // Specifications
        maxGuests: data.maxGuests,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        basePrice: data.basePrice,
        
        // Timing
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        
        // Policies
        cancellationPolicy: data.cancellationPolicy,
        houseRules: data.houseRules,
        termsConditions: data.termsConditions,
        
        // Social
        facebook: data.facebook,
        instagram: data.instagram,
        twitter: data.twitter,
        
        // Media
        images: data.images,
        amenities: data.amenities
      };
      
      
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      
      if (result.success) {
        // Refresh data after successful update
        await fetchHomepageContent();
        return { 
          success: true, 
          message: result.message || 'Homepage content updated successfully'
        };
      } else {
        throw new Error(result.message || 'Failed to update homepage content');
      }
    } catch (err) {
      console.error('🚨 Homepage content update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update homepage content';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  useEffect(() => {
    fetchHomepageContent();
  }, []);

  return {
    homepageContent,
    loading,
    error,
    refetch: fetchHomepageContent,
    updateHomepageContent
  };
};
