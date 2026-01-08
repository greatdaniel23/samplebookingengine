import React, { useState } from 'react';

interface FilterButtonsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              activeCategory === category
                ? 'bg-hotel-sage text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// Specialized filter for room/package categories
interface RoomFilterButtonsProps {
  onFilterChange?: (filter: string) => void;
}

export const RoomFilterButtons: React.FC<RoomFilterButtonsProps> = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    'All',
    '1 night(s)',
    '2 night(s)', 
    '3 night(s)',
    '4 night(s)',
    '5 night(s)',
    '7 night(s)'
  ];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <FilterButtons
      categories={filters}
      activeCategory={activeFilter}
      onCategoryChange={handleFilterClick}
    />
  );
};

// Specialized filter for spa/massage categories  
export const SpaFilterButtons: React.FC<RoomFilterButtonsProps> = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    'All',
    'Relaxing Massage',
    'Relaxing Ritual',
    'Romantic Spa Package',
    'Sensory Surrender',
    'Spa Secret',
    'Warm Stone Massage'
  ];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <FilterButtons
      categories={filters}
      activeCategory={activeFilter}
      onCategoryChange={handleFilterClick}
    />
  );
};

// Specialized filter for dining categories
export const DiningFilterButtons: React.FC<RoomFilterButtonsProps> = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    'All',
    'Floating Breakfast',
    'High Tea'
  ];

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <FilterButtons
      categories={filters}
      activeCategory={activeFilter}
      onCategoryChange={handleFilterClick}
    />
  );
};