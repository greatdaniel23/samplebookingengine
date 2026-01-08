import React, { useState } from 'react';
import { SpaFilterButtons, DiningFilterButtons } from './FilterButtons';

interface ServiceCardProps {
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image?: string;
  onBook?: () => void;
  onDiscover?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  price,
  originalPrice,
  discount,
  image,
  onBook,
  onDiscover
}) => {
  const defaultImage = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div 
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${image || defaultImage})` }}
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mb-3">{description}</p>
        )}
        
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Starting From</p>
          <div className="flex items-center space-x-2">
            {discount && originalPrice && (
              <>
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{discount}</span>
                <span className="text-gray-400 line-through text-sm">{originalPrice}</span>
              </>
            )}
            <p className="font-bold text-lg text-gray-800">{price}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onDiscover}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
          >
            Discover
          </button>
          <button
            onClick={onBook}
            className="flex-1 bg-hotel-sage text-white py-2 px-3 rounded text-sm hover:bg-hotel-sage-dark transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Spa & Massage Section
export const SpaSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const spaServices = [
    {
      title: "Warm Stone Massage (1.5 hours)",
      price: "IDR 1,202,740",
      originalPrice: "IDR 1,718,200",
      discount: "30% OFF",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Relaxing Massage",
      price: "IDR 868,175",
      originalPrice: "IDR 1,240,250", 
      discount: "30% OFF",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Relaxing Ritual (2 hours)",
      price: "IDR 1,668,590",
      originalPrice: "IDR 2,383,700",
      discount: "30% OFF",
      image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Romantic Spa Package (2 hours)",
      price: "IDR 2,520,000",
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <section className="my-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 text-hotel-navy">MASSAGES and SPA</h2>
        <p className="text-xl text-hotel-bronze max-w-3xl mx-auto">
          Relax & Rejuvenate: The Ultimate Spa & Massage Experience
        </p>
      </div>

      <SpaFilterButtons onFilterChange={setActiveFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {spaServices.map((service, index) => (
          <ServiceCard 
            key={index}
            {...service}
            onBook={() => console.log('Book spa service:', service.title)}
            onDiscover={() => console.log('Discover spa service:', service.title)}
          />
        ))}
      </div>

      <div className="text-center">
        <button className="bg-white border border-hotel-sage text-hotel-sage px-6 py-3 rounded-lg hover:bg-hotel-sage hover:text-white transition-colors">
          Show all
        </button>
      </div>
    </section>
  );
};

// Dining Section
export const DiningSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const diningOptions = [
    {
      title: "High Tea",
      price: "IDR 266,200",
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Floating Breakfast",
      price: "IDR 353,320",
      originalPrice: "IDR 441,650",
      discount: "20% OFF",
      image: "https://images.unsplash.com/photo-1533910534207-90f31029a78e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <section className="my-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 text-hotel-navy">Dining</h2>
        <p className="text-xl text-hotel-bronze max-w-3xl mx-auto">
          Where Every Bite is a Pleasure
        </p>
      </div>

      <DiningFilterButtons onFilterChange={setActiveFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {diningOptions.map((option, index) => (
          <ServiceCard 
            key={index}
            {...option}
            onBook={() => console.log('Book dining:', option.title)}
            onDiscover={() => console.log('Discover dining:', option.title)}
          />
        ))}
      </div>

      <div className="text-center">
        <button className="bg-white border border-hotel-sage text-hotel-sage px-6 py-3 rounded-lg hover:bg-hotel-sage hover:text-white transition-colors">
          Show all
        </button>
      </div>
    </section>
  );
};

// Experiences Section
export const ExperiencesSection: React.FC = () => {
  const experiences = [
    {
      title: "Candle Light Dinner",
      description: "Starting From",
      price: "IDR 3,158,000",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Starlight Dinner", 
      description: "Starting From",
      price: "IDR 4,012,000",
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Market Tour and Cooking Lesson",
      description: "Starting From", 
      price: "IDR 2,159,850",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Ayung Riverside Picnic Lunch",
      description: "Starting From",
      price: "IDR 1,300,000",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <section className="my-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 text-hotel-navy">EXPERIENCES</h2>
        <p className="text-xl text-hotel-bronze max-w-3xl mx-auto">
          Your Next Adventure Starts Here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {experiences.map((experience, index) => (
          <ServiceCard 
            key={index}
            {...experience}
            onBook={() => console.log('Book experience:', experience.title)}
            onDiscover={() => console.log('Discover experience:', experience.title)}
          />
        ))}
      </div>

      <div className="text-center">
        <button className="bg-white border border-hotel-sage text-hotel-sage px-6 py-3 rounded-lg hover:bg-hotel-sage hover:text-white transition-colors">
          Show all
        </button>
      </div>
    </section>
  );
};