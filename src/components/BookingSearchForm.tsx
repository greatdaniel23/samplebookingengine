import React, { useState } from 'react';
import { Calendar, Users, Search } from 'lucide-react';

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

    if (onSearch) {
      onSearch(searchData);
    }
  };

  const getTotalNights = () => {
    if (searchData.checkIn && searchData.checkOut) {
      const checkIn = new Date(searchData.checkIn);
      const checkOut = new Date(searchData.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return dayDiff > 0 ? dayDiff : 0;
    }
    return 1;
  };

  const totalGuests = searchData.adults + searchData.children;

  return (
    <div className="bg-white shadow-lg rounded-xl p-4">
      {/* Mobile: 3 rows | Desktop: Single row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">

        {/* Row 1: Date Inputs - Side by side */}
        <div className="flex gap-2 md:flex-1">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Check-in</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={searchData.checkIn}
                onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full text-sm border border-gray-300 rounded-lg pl-9 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-hotel-sage focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Check-out</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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

        {/* Nights indicator */}
        {getTotalNights() > 0 && (
          <div className="text-xs text-hotel-sage text-center md:hidden">
            {getTotalNights()} night{getTotalNights() !== 1 ? 's' : ''}
          </div>
        )}

        {/* Divider - Desktop only */}
        <div className="hidden md:block w-px h-10 bg-gray-200"></div>

        {/* Row 2: Total Guests */}
        <div className="relative md:min-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">Guests</label>
          <div
            className="flex items-center justify-between gap-2 cursor-pointer border border-gray-300 px-3 py-2.5 rounded-lg hover:border-hotel-sage transition-colors"
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}
              </span>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Guests Dropdown */}
          {showGuestDropdown && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Adults</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSearchData({ ...searchData, adults: Math.max(1, searchData.adults - 1) }); }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg"
                    >−</button>
                    <span className="w-6 text-center font-medium">{searchData.adults}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSearchData({ ...searchData, adults: searchData.adults + 1 }); }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg"
                    >+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Children</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSearchData({ ...searchData, children: Math.max(0, searchData.children - 1) }); }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg"
                    >−</button>
                    <span className="w-6 text-center font-medium">{searchData.children}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSearchData({ ...searchData, children: searchData.children + 1 }); }}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-lg"
                    >+</button>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowGuestDropdown(false); }}
                  className="w-full bg-hotel-sage text-white py-2 rounded-lg hover:bg-hotel-sage-dark transition-colors text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Search Button */}
        <button
          onClick={handleSearch}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-hotel-sage text-white px-6 py-3 rounded-lg font-medium hover:bg-hotel-sage-dark transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Check Availability</span>
        </button>
      </div>
    </div>
  );
};

