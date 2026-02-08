
import React, { useState, useMemo, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import { ApiService } from '../services/api';
import { type Vehicle, VehicleCategory } from '../types';
import Skeleton from '../components/Skeleton';

const Fleet: React.FC = () => {
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFleet = async () => {
      setIsLoading(true);
      try {
        const vehicles = await ApiService.getVehicles();
        console.log('Fetched vehicles from backend:', vehicles);
        if (vehicles.length === 0) {
          console.warn('Backend returned empty array - check if vehicles exist in database');
        }
        setAllVehicles(vehicles);
      } catch (error) {
        console.error("Failed to load fleet:", error);
        console.warn('Showing empty fleet. Ensure backend is running at http://localhost:8000');
        setAllVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFleet();
  }, []);

  const filteredVehicles = useMemo(() => {
    return allVehicles.filter(v => {
      const categoryMatch = selectedCategory === 'All' || v.category === selectedCategory;
      const searchMatch = (v.make + ' ' + v.model).toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [allVehicles, selectedCategory, searchQuery]);

  const categories = ['All', ...Object.values(VehicleCategory)];

  return (
    <div className="pt-32 pb-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl font-bold serif">The Fleet <span className="gold-text italic">Collection</span></h1>
          <p className="text-white/40 max-w-xl uppercase tracking-widest text-xs">Browse our meticulously curated selection of the world's most desirable automobiles.</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-8 mb-16 items-center justify-between border-b border-white/10 pb-8">
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all ${
                  selectedCategory === cat 
                  ? 'gold-bg text-black border-[#d4af37]' 
                  : 'text-white/50 border-white/10 hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search make or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 px-4 py-2 text-xs focus:outline-none focus:border-[#d4af37] text-white"
            />
            <svg className="w-4 h-4 text-white/30 absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass p-0 rounded-sm overflow-hidden border border-white/10">
                <Skeleton variant="rect" className="aspect-[4/3] w-full" />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton variant="text" className="h-6 w-32" />
                      <Skeleton variant="text" className="h-4 w-24" />
                    </div>
                    <Skeleton variant="text" className="h-6 w-20" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/10">
                    <Skeleton variant="rect" className="h-12" />
                    <Skeleton variant="rect" className="h-12" />
                    <Skeleton variant="rect" className="h-12" />
                  </div>
                  <Skeleton variant="rect" className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredVehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-32 space-y-4">
                <div className="w-16 h-16 gold-bg/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold serif">No Vehicles Found</h3>
                <p className="text-white/40 text-sm">We couldn't find any vehicles matching your current filters.</p>
                <button 
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="gold-text uppercase tracking-widest text-[10px] font-bold hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Fleet;
