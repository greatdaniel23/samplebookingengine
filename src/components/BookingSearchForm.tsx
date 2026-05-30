import React, { useState } from 'react';
import { Calendar, Users, Search, X, ChevronDown } from 'lucide-react';

interface BookingSearchFormProps {
  onSearch?: (searchData: BookingSearchData) => void;
}

interface BookingSearchData {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  promoCode: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const BookingSearchForm: React.FC<BookingSearchFormProps> = ({ onSearch }) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [searchData, setSearchData] = useState<BookingSearchData>({
    checkIn: today.toISOString().split('T')[0],
    checkOut: tomorrow.toISOString().split('T')[0],
    adults: 2,
    children: 0,
    promoCode: ''
  });

  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = () => {
    if (!searchData.checkIn || !searchData.checkOut) {
      alert('Please select both check-in and check-out dates');
      return;
    }
    const checkIn = new Date(searchData.checkIn);
    const checkOut = new Date(searchData.checkOut);
    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }
    setMobileOpen(false);
    if (onSearch) onSearch(searchData);
  };

  const getTotalNights = () => {
    if (searchData.checkIn && searchData.checkOut) {
      const checkIn = new Date(searchData.checkIn);
      const checkOut = new Date(searchData.checkOut);
      const dayDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
      return dayDiff > 0 ? dayDiff : 0;
    }
    return 1;
  };

  const totalGuests = searchData.adults + searchData.children;
  const nights = getTotalNights();

  // ── Shared form fields (used in both desktop and mobile modal) ──
  const FormFields = () => (
    <>
      {/* Dates row */}
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-gray-500 mb-1">Check-in</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={searchData.checkIn}
              onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-hotel-sage focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs text-gray-500 mb-1">Check-out</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={searchData.checkOut}
              onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
              min={searchData.checkIn || new Date().toISOString().split('T')[0]}
              className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-hotel-sage focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {nights > 0 && (
        <div className="text-xs text-hotel-sage text-center">
          {nights} night{nights !== 1 ? 's' : ''}
        </div>
      )}

      {/* Guests */}
      <div className="relative">
        <label className="block text-xs text-gray-500 mb-1">Guests</label>
        <div
          className="flex items-center justify-between gap-2 cursor-pointer border border-gray-300 px-3 py-2.5 rounded-lg hover:border-hotel-sage transition-colors"
          onClick={() => setShowGuestDropdown(!showGuestDropdown)}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{totalGuests} Guest{totalGuests !== 1 ? 's' : ''}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
        </div>
        {showGuestDropdown && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-30">
            <div className="space-y-3">
              {[
                { label: 'Adults', key: 'adults' as const, min: 1 },
                { label: 'Children', key: 'children' as const, min: 0 },
              ].map(({ label, key, min }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSearchData({ ...searchData, [key]: Math.max(min, searchData[key] - 1) }); }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg"
                    >−</button>
                    <span className="w-6 text-center font-medium">{searchData[key]}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSearchData({ ...searchData, [key]: searchData[key] + 1 }); }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg"
                    >+</button>
                  </div>
                </div>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); setShowGuestDropdown(false); }}
                className="w-full bg-hotel-sage text-white py-2 rounded-lg hover:bg-hotel-sage-dark transition-colors text-sm font-medium"
              >Done</button>
            </div>
          </div>
        )}
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="w-full flex items-center justify-center gap-2 bg-hotel-sage text-white px-6 py-3 rounded-lg font-medium hover:bg-hotel-sage-dark transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Check Availability</span>
      </button>
    </>
  );

  return (
    <>
      {/* ── MOBILE: compact pill bar ── */}
      <div className="md:hidden bg-white shadow-lg rounded-xl px-4 py-3 w-full">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-4 h-4 text-hotel-sage flex-shrink-0" />
            <div className="text-left min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {formatDate(searchData.checkIn)} → {formatDate(searchData.checkOut)}
                <span className="text-gray-400 font-normal"> · {nights}n</span>
              </div>
              <div className="text-xs text-gray-400">{totalGuests} Guest{totalGuests !== 1 ? 's' : ''}</div>
            </div>
          </div>
          <span className="flex-shrink-0 bg-hotel-sage text-white text-xs font-medium px-3 py-1.5 rounded-lg">
            Edit
          </span>
        </button>
      </div>

      {/* ── MOBILE: bottom-sheet modal ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* sheet */}
          <div className="relative bg-white rounded-t-2xl p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-800">Search Availability</h3>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <FormFields />
          </div>
        </div>
      )}

      {/* ── DESKTOP: full inline bar ── */}
      <div className="hidden md:block bg-white shadow-lg rounded-xl p-4 w-full">
        <div className="flex items-center gap-4">
          {/* Dates */}
          <div className="flex gap-2 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <label className="block text-xs text-gray-500 mb-1">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-hotel-sage focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs text-gray-500 mb-1">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData({ ...searchData, checkOut: e.target.value })}
                  min={searchData.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-hotel-sage focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="w-px h-10 bg-gray-200" />

          {/* Guests */}
          <div className="relative min-w-[180px]">
            <label className="block text-xs text-gray-500 mb-1">Guests</label>
            <div
              className="flex items-center justify-between gap-2 cursor-pointer border border-gray-300 px-3 py-2.5 rounded-lg hover:border-hotel-sage transition-colors"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{totalGuests} Guest{totalGuests !== 1 ? 's' : ''}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showGuestDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
                <div className="space-y-3">
                  {[
                    { label: 'Adults', key: 'adults' as const, min: 1 },
                    { label: 'Children', key: 'children' as const, min: 0 },
                  ].map(({ label, key, min }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSearchData({ ...searchData, [key]: Math.max(min, searchData[key] - 1) }); }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg"
                        >−</button>
                        <span className="w-6 text-center font-medium">{searchData[key]}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSearchData({ ...searchData, [key]: searchData[key] + 1 }); }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg"
                        >+</button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowGuestDropdown(false); }}
                    className="w-full bg-hotel-sage text-white py-2 rounded-lg hover:bg-hotel-sage-dark transition-colors text-sm font-medium"
                  >Done</button>
                </div>
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-hotel-sage text-white px-6 py-3 rounded-lg font-medium hover:bg-hotel-sage-dark transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Check Availability</span>
          </button>
        </div>
      </div>
    </>
  );
};
