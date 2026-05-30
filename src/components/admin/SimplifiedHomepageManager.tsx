import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useHomepageContent } from '@/hooks/useHomepageContent';
import {
  Edit3,
  Save,
  X,
  Clock,
  Shield,
} from 'lucide-react';

// Samudra input constants (matches Settings/Bookings pattern)
const samudraInput = "h-11 w-full bg-samudra-paper border border-samudra-paper-deep px-3 text-[14px] focus:border-samudra-teal focus:outline-none transition-colors";
const samudraTextarea = "w-full bg-samudra-paper border border-samudra-paper-deep px-3 py-2.5 text-[14px] focus:border-samudra-teal focus:outline-none transition-colors resize-none";
const samudraFieldDisplay = "text-[14px] text-samudra-ink bg-samudra-paper-soft border border-samudra-paper-deep px-3 py-2.5 min-h-[44px]";
const samudraLabel = "eyebrow block mb-2";

// Simple interface matching actual database fields
interface VillaData {
  name: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  checkInTime: string;
  checkOutTime: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;
  currency: string;
  cancellationPolicy: string;
  houseRules: string;
}

const SimplifiedHomepageManager: React.FC = () => {
  const { homepageContent, loading, error, updateHomepageContent, refetch } = useHomepageContent();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<VillaData | null>(null);
  const [saving, setSaving] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (homepageContent) {
      console.log('Updating formData from homepageContent:', homepageContent.name);
      setFormData({
        name: homepageContent.name || '',
        description: homepageContent.description || '',
        phone: homepageContent.phone || '',
        email: homepageContent.email || '',
        website: homepageContent.website || '',
        address: homepageContent.address || '',
        city: homepageContent.city || '',
        state: homepageContent.state || '',
        country: homepageContent.country || '',
        zipCode: homepageContent.zipcode || '',
        checkInTime: homepageContent.checkIn || '',
        checkOutTime: homepageContent.checkOut || '',
        maxGuests: homepageContent.maxGuests || 0,
        bedrooms: homepageContent.bedrooms || 0,
        bathrooms: homepageContent.bathrooms || 0,
        basePrice: homepageContent.basePrice || 0,
        currency: 'IDR',
        cancellationPolicy: homepageContent.cancellationPolicy || '',
        houseRules: homepageContent.houseRules || ''
      });
    }
  }, [homepageContent]);

  const handleInputChange = (field: keyof VillaData, value: string | number) => {
    if (formData) {
      setFormData(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const result = await updateHomepageContent({
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipCode,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        maxGuests: formData.maxGuests,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        cancellationPolicy: formData.cancellationPolicy,
        houseRules: formData.houseRules
      });

      if (result.success) {
        console.log('Update API returned success, now refetching...');
        // Force refetch to ensure UI shows updated data
        await refetch();
        console.log('Refetch complete, homepageContent should be updated');
        setIsEditing(false);
        toast.success('Property saved');
      } else {
        console.error('Update failed:', result.error);
        toast.error('Save failed', { description: 'Verify network and retry.' });
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Save failed', { description: 'Verify network and retry.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (homepageContent) {
      setFormData({
        name: homepageContent.name || '',
        description: homepageContent.description || '',
        phone: homepageContent.phone || '',
        email: homepageContent.email || '',
        website: homepageContent.website || '',
        address: homepageContent.address || '',
        city: homepageContent.city || '',
        state: homepageContent.state || '',
        country: homepageContent.country || '',
        zipCode: homepageContent.zipcode || '',
        checkInTime: homepageContent.checkIn || '',
        checkOutTime: homepageContent.checkOut || '',
        maxGuests: homepageContent.maxGuests || 0,
        bedrooms: homepageContent.bedrooms || 0,
        bathrooms: homepageContent.bathrooms || 0,
        basePrice: homepageContent.basePrice || 0,
        currency: 'IDR',
        cancellationPolicy: homepageContent.cancellationPolicy || '',
        houseRules: homepageContent.houseRules || ''
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-6 w-6 border-2 border-samudra-ink border-t-transparent mr-3" />
        <span className="eyebrow text-samudra-ink-mute">Loading villa data...</span>
      </div>
    );
  }

  if (error && !homepageContent) {
    const handleRetry = async () => {
      setRetrying(true);
      await refetch();
      setRetrying(false);
    };

    return (
      <div className="bg-samudra-paper-soft border border-samudra-paper-deep p-6 card-accent-teal">
        <h3 className="font-display text-[18px] font-light text-samudra-ink mb-2">Error Loading Data</h3>
        <p className="text-[13px] text-samudra-ink-mute mb-4">{error}</p>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="h-9 px-5 bg-samudra-ink text-samudra-paper eyebrow text-[10px] tracking-[0.3em] hover:bg-samudra-teal transition-colors disabled:opacity-50"
          style={{ fontFamily: 'var(--font-label)' }}
        >
          {retrying ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="py-10 text-center">
        <p className="font-script text-samudra-gold text-[22px]">no data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-4">
      {/* Samudra page header + action buttons */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-script text-samudra-gold text-[28px] leading-none mb-2">your property, your story</p>
          <h2 className="font-display text-[40px] font-light text-samudra-ink">Villa Information</h2>
          <div className="h-px w-[60px] bg-samudra-ink mt-3" style={{ opacity: 0.4 }} />
        </div>
        <div className="flex gap-3 mb-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="h-10 px-5 border border-samudra-ink text-samudra-ink hover:bg-samudra-paper-soft transition-colors eyebrow text-[10px] tracking-[0.3em] disabled:opacity-50 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-10 px-5 bg-samudra-ink text-samudra-paper hover:bg-samudra-teal transition-colors eyebrow text-[10px] tracking-[0.3em] disabled:opacity-50 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-label)' }}
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="h-10 px-5 border border-samudra-ink text-samudra-ink hover:bg-samudra-ink hover:text-samudra-paper transition-colors eyebrow text-[10px] tracking-[0.3em] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-label)' }}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Villa Info
            </button>
          )}
        </div>
      </div>

      {/* Section: Basic Information */}
      <div className="bg-samudra-paper border border-samudra-paper-deep">
        <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
          <p className="eyebrow text-samudra-ink-mute">About</p>
          <h3 className="font-display text-[20px] font-light text-samudra-ink">Basic Information</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={samudraLabel}>Property Name</label>
              {isEditing ? (
                <input type="text" value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.name || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className={samudraLabel}>Country</label>
              {isEditing ? (
                <input type="text" value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.country || 'Not set'}</div>
              )}
            </div>
          </div>
          <div>
            <label className={samudraLabel}>Description</label>
            {isEditing ? (
              <textarea value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3} className={samudraTextarea} style={{ fontFamily: 'var(--font-label)' }} />
            ) : (
              <div className={`${samudraFieldDisplay} min-h-[80px]`}>{formData.description || 'No description'}</div>
            )}
          </div>
        </div>
      </div>

      {/* Section: Contact Information */}
      <div className="bg-samudra-paper border border-samudra-paper-deep">
        <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
          <p className="eyebrow text-samudra-ink-mute">Reach us</p>
          <h3 className="font-display text-[20px] font-light text-samudra-ink">Contact Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div>
              <label className={samudraLabel}>Phone</label>
              {isEditing ? (
                <input type="text" value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.phone || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className={samudraLabel}>Email</label>
              {isEditing ? (
                <input type="email" value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.email || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className={samudraLabel}>Website</label>
              {isEditing ? (
                <input type="url" value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.website || 'Not set'}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Address */}
      <div className="bg-samudra-paper border border-samudra-paper-deep">
        <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
          <p className="eyebrow text-samudra-ink-mute">Where to find us</p>
          <h3 className="font-display text-[20px] font-light text-samudra-ink">Address</h3>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className={samudraLabel}>Street Address</label>
            {isEditing ? (
              <input type="text" value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
            ) : (
              <div className={samudraFieldDisplay}>{formData.address || 'Not set'}</div>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={samudraLabel}>City</label>
              {isEditing ? (
                <input type="text" value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.city || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className={samudraLabel}>State / Province</label>
              {isEditing ? (
                <input type="text" value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.state || 'Not set'}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Check-in/out Times */}
      <div className="bg-samudra-paper border border-samudra-paper-deep">
        <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
          <p className="eyebrow text-samudra-ink-mute">Schedule</p>
          <h3 className="font-display text-[20px] font-light text-samudra-ink">Check-in / Check-out</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={samudraLabel}>Check-in Time</label>
              {isEditing ? (
                <input type="text" value={formData.checkInTime}
                  onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                  placeholder="e.g., 3:00 PM"
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.checkInTime || 'Not set'}</div>
              )}
            </div>
            <div>
              <label className={samudraLabel}>Check-out Time</label>
              {isEditing ? (
                <input type="text" value={formData.checkOutTime}
                  onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                  placeholder="e.g., 11:00 AM"
                  className={samudraInput} style={{ fontFamily: 'var(--font-label)' }} />
              ) : (
                <div className={samudraFieldDisplay}>{formData.checkOutTime || 'Not set'}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Policies */}
      <div className="bg-samudra-paper border border-samudra-paper-deep">
        <div className="px-6 pt-5 pb-3 border-b border-samudra-paper-deep">
          <p className="eyebrow text-samudra-ink-mute">House Rules</p>
          <h3 className="font-display text-[20px] font-light text-samudra-ink">Property Policies</h3>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className={samudraLabel}>Cancellation Policy</label>
            {isEditing ? (
              <textarea value={formData.cancellationPolicy}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                rows={3} placeholder="e.g., Free cancellation up to 48 hours before check-in..."
                className={samudraTextarea} style={{ fontFamily: 'var(--font-label)' }} />
            ) : (
              <div className={`${samudraFieldDisplay} min-h-[80px]`}>
                {formData.cancellationPolicy || 'No cancellation policy set'}
              </div>
            )}
          </div>
          <div>
            <label className={samudraLabel}>House Rules</label>
            {isEditing ? (
              <textarea value={formData.houseRules}
                onChange={(e) => handleInputChange('houseRules', e.target.value)}
                rows={3} placeholder="e.g., No smoking · No pets · Quiet hours 10 PM - 8 AM..."
                className={samudraTextarea} style={{ fontFamily: 'var(--font-label)' }} />
            ) : (
              <div className={`${samudraFieldDisplay} min-h-[80px]`}>
                {formData.houseRules || 'No house rules set'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedHomepageManager;