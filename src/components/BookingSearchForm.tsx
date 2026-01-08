import React, { useState } from 'react';
import { Calendar, Users, Search, Tag } from 'lucide-react';

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
  // Get today's date and tomorrow for default values
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [searchData, setSearchData] = useState<BookingSearchData>({
    checkIn: today.toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    checkOut: tomorrow.toISOString().split('T')[0], // Tomorrow's date in YYYY-MM-DD format
    adults: 2,
    children: 0,
    promoCode: ''
  });

  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const handleSearch = () => {
    // Validate dates before searching
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

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Villa Name */}
        <div className="flex items-center text-sm font-medium text-gray-700">
          <div className="w-4 h-4 bg-hotel-sage rounded mr-2"></div>
          <span>Rumah Daisy Cantik</span>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-8 bg-gray-200"></div>

        {/* Check-in / Check-out */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={searchData.checkIn}
              onChange={(e) => setSearchData({...searchData, checkIn: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-hotel-sage"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={searchData.checkOut}
              onChange={(e) => setSearchData({...searchData, checkOut: e.target.value})}
              min={searchData.checkIn || new Date().toISOString().split('T')[0]}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-hotel-sage"
            />
            {getTotalNights() > 0 && (
              <span className="text-gray-500 text-sm ml-2">
                {getTotalNights()} night{getTotalNights() !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-8 bg-gray-200"></div>

        {/* Guests */}
        <div className="relative">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
          >
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">
              {searchData.adults} Adult{searchData.adults !== 1 ? 's' : ''}
              {searchData.children > 0 && `, ${searchData.children} Child${searchData.children !== 1 ? 'ren' : ''}`}
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Guests Dropdown */}
          {showGuestDropdown && (
            <div className="absolute top-full mt-2 left-0 bg-white border rounded-lg shadow-lg p-4 w-64 z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Adults</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSearchData({...searchData, adults: Math.max(1, searchData.adults - 1)})}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{searchData.adults}</span>
                    <button
                      onClick={() => setSearchData({...searchData, adults: searchData.adults + 1})}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Children</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSearchData({...searchData, children: Math.max(0, searchData.children - 1)})}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{searchData.children}</span>
                    <button
                      onClick={() => setSearchData({...searchData, children: searchData.children + 1})}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuestDropdown(false)}
                  className="w-full bg-hotel-sage text-white py-2 rounded-md hover:bg-hotel-sage-dark transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

        {/* Promo Code */}
        <div className="relative hidden lg:block">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
            onClick={() => setShowPromoInput(!showPromoInput)}
          >
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {searchData.promoCode || 'Promo code'}
            </span>
          </div>

          {/* Promo Code Input */}
          {showPromoInput && (
            <div className="absolute top-full mt-2 left-0 bg-white border rounded-lg shadow-lg p-4 w-48 z-10">
              <input
                type="text"
                value={searchData.promoCode}
                onChange={(e) => setSearchData({...searchData, promoCode: e.target.value})}
                placeholder="Enter promo code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-hotel-sage"
              />
              <button
                onClick={() => setShowPromoInput(false)}
                className="w-full mt-2 bg-hotel-sage text-white py-2 rounded-md text-sm hover:bg-hotel-sage-dark transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="flex items-center space-x-2 bg-hotel-sage text-white px-6 py-3 rounded-md font-medium hover:bg-hotel-sage-dark transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Check Availability</span>
          <span className="sm:hidden">Search</span>
        </button>
      </div>
    </div>
  );
};