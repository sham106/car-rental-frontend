import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleCard from '../components/VehicleCard';
import SkeletonCard from '../components/SkeletonCard';
import { ApiService } from '../services/api';
import { type Vehicle } from '../types';
import LuxeConcierge from '../components/LuxeConcierge';
import Hero from '../assets/Hero.png'

const Home: React.FC = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalFleetSize, setTotalFleetSize] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured vehicles (only 3) and total count in parallel
        const [featuredVehicles, totalCount] = await Promise.all([
          ApiService.getVehicles(3),
          ApiService.getVehicleCount(),
        ]);
        setFeaturedVehicles(featuredVehicles);
        setTotalFleetSize(totalCount);
      } catch (error) {
        console.error('Failed to load featured vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex items-center overflow-hidden pb-20">
        {/* Cinematic Background */}
        <div className="absolute inset-0 bg-black">
          <img 
            src={Hero}
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-3xl space-y-8 animate-fadeIn">
            <div className="inline-block px-4 py-1 border border-[#d4af37]/30 bg-[#d4af37]/10 rounded-full">
              <span className="text-[10px] uppercase tracking-[0.3em] gold-text font-bold">Elite Concierge Service</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold leading-tight serif">
              The Art of <br />
              <span className="gold-text italic">The Arrival</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-xl">
              Curated luxury rentals for those who understand that the journey is the destination. Select your suite of motion.
            </p>
            
            {/* Floating Booking Widget - NOW POSITIONED HERE */}
            <div className="w-full max-w-5xl pt-8 pb-8 hidden lg:block">
              <div className="glass p-8 rounded-sm grid grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Pick-up Location</label>
                  <div className="relative">
                    <input type="text" placeholder="Dubai Marina" className="w-full bg-white/5 border-b border-white/10 py-2 text-sm focus:outline-none focus:border-[#d4af37] text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Pick-up Date</label>
                  <input type="date" className="w-full bg-transparent border-b border-white/10 py-2 text-sm focus:outline-none focus:border-[#d4af37] text-white inverted-calendar" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Return Date</label>
                  <input type="date" className="w-full bg-transparent border-b border-white/10 py-2 text-sm focus:outline-none focus:border-[#d4af37] text-white inverted-calendar" />
                </div>
                <button className="gold-bg text-black py-3 px-6 font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform">
                  Find Vehicle
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                to="/fleet" 
                className="gold-bg text-black px-10 py-4 font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all text-center"
              >
                Reserve Your Suite
              </Link>
              <button 
                onClick={() => document.getElementById('bespoke-services')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-white/20 hover:border-white px-10 py-4 font-bold uppercase tracking-widest text-sm transition-all text-center bg-white/5 backdrop-blur-sm cursor-pointer"
              >
                Explore Services
              </button>
            </div>
          </div>
        </div>

        {/* REMOVED - Old floating calendar that was at the bottom */}
      </section>

      {/* Featured Fleet Section */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold serif">The Featured Collection</h2>
              <div className="w-24 h-1 gold-bg"></div>
            </div>
            <Link to="/fleet" className="text-sm uppercase tracking-[0.2em] gold-text font-bold hover:underline">
              View All {totalFleetSize > 0 ? `${totalFleetSize} ` : ''}Vehicles
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : featuredVehicles.length > 0 ? (
              featuredVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)
            ) : (
              <p className="text-white/50 col-span-3 text-center">No featured vehicles available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section id="bespoke-services" className="py-24 bg-[#111] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#d4af37]/5 -skew-x-12 transform translate-x-1/2"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-5xl font-bold serif">Bespoke Services</h3>
                <p className="text-white/50 max-w-lg leading-relaxed">
                  Beyond the keys, we provide a complete lifestyle solution for the discerning traveler.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4 p-6 glass rounded-sm">
                  <div className="w-12 h-12 gold-bg flex items-center justify-center rounded-sm">
                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-bold uppercase tracking-widest text-xs">Airport Concierge</h4>
                  <p className="text-xs text-white/40 leading-relaxed">Personal greeters and baggage handling upon arrival.</p>
                </div>
                <div className="space-y-4 p-6 glass rounded-sm">
                  <div className="w-12 h-12 gold-bg flex items-center justify-center rounded-sm">
                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold uppercase tracking-widest text-xs">Private Chauffeur</h4>
                  <p className="text-xs text-white/40 leading-relaxed">Professional drivers available for half or full day bookings.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
                <img src="https://picsum.photos/id/111/800/1000" alt="Service" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -left-10 glass p-8 max-w-xs animate-float">
                <p className="text-lg italic serif text-white/90">"Excellence isn't an act, it's a habit. LuxeDrive delivers that every single time."</p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-8 h-[1px] gold-bg"></div>
                  <span className="text-[10px] uppercase tracking-widest gold-text font-bold">VIP Member</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Concierge Component */}
      <LuxeConcierge />
    </div>
  );
};

export default Home;