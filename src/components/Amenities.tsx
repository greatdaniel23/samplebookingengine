"use client";

import {
  Wifi,
  Bath,
  Flame,
  CookingPot,
  Car,
  AirVent,
  LucideProps,
} from "lucide-react";

interface Amenity {
  name: string;
  icon: keyof typeof iconMap;
}

interface AmenitiesProps {
  amenities: Amenity[];
}

const iconMap: { [key: string]: React.ComponentType<LucideProps> } = {
  Wifi,
  Bath,
  Flame,
  CookingPot,
  Car,
  AirVent,
};

export const Amenities = ({ amenities }: AmenitiesProps) => {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">What this place offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {amenities.map((amenity) => {
          const IconComponent = iconMap[amenity.icon];
          return (
            <div key={amenity.name} className="flex items-center space-x-3">
              {IconComponent && <IconComponent className="w-6 h-6 text-gray-700" />}
              <span className="text-gray-700">{amenity.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};