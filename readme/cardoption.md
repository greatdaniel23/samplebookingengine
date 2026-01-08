import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Robust Inline SVGs to ensure no dependency "fail to load" issues
 */
const Icons = {
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Maximize: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
  ),
  Wind: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
  ),
  Coffee: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x2="10" y1="2" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
  ),
  Wifi: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M2 8.82a15 15 0 0 1 20 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  )
};

const RoomCard = ({ 
  image = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800",
  title = "Grand Signature Suite",
  price = 450,
  rating = 4.9,
  reviews = 128,
  guests = 2,
  size = "45m²",
  description = "Experience luxury with panoramic city views and premium Italian linens."
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 border border-slate-100 group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg">
          <span className="text-lg font-bold">${price}</span>
          <span className="text-[10px] opacity-70 ml-1">/ night</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">{title}</h3>

        <div className="flex items-center gap-4 mb-6 text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="text-indigo-500"><Icons.Users /></span>
            <span className="text-xs font-medium">{guests} Guests</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
            <span className="text-indigo-500"><Icons.Maximize /></span>
            <span className="text-xs font-medium">{size}</span>
          </div>
        </div>

        {/* Amenities Icons */}
        <div className="flex gap-3 mb-8">
          <AmenityItem icon={<Icons.Wind />} label="AC" />
          <AmenityItem icon={<Icons.Coffee />} label="Breakfast" />
          <AmenityItem icon={<Icons.Wifi />} label="Wi-Fi" />
        </div>

        {/* Dynamic Action Area */}
        <div className="relative h-12 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isHovered ? (
              <motion.p
                key="desc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-slate-400 line-clamp-2"
              >
                {description}
              </motion.p>
            ) : (
              <motion.button
                key="btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full h-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
              >
                Book This Room
                <Icons.ArrowRight />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Visual Feedback Border */}
      <motion.div 
        animate={{ opacity: isHovered ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none border-2 border-indigo-500/20 rounded-3xl" 
      />
    </motion.div>
  );
};

const AmenityItem = ({ icon, label }) => (
  <div className="group/item relative">
    <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-all">
      {icon}
    </div>
    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </span>
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Luxury Accommodations</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Selected boutique rooms for your next unforgettable journey.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <RoomCard 
            title="Royal Ocean View" 
            price={620} 
            image="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"
          />
          <RoomCard 
            title="Modern Minimalist Loft" 
            price={290} 
            image="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800"
          />
          <RoomCard 
            title="Zen Garden Suite" 
            price={380} 
            image="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800"
          />
        </div>
      </div>
    </div>
  );
}