
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ApiService } from '../services/api';
import { type Vehicle } from '../types';
import Skeleton from '../components/Skeleton';

const VehicleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      setError("No vehicle ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await ApiService.getVehicleById(id);
        setVehicle(data);
      } catch (err: any) {
        setError(err.message || "Failed to load vehicle details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const galleryImages = [vehicle?.image, ...(vehicle?.gallery || [])].filter(Boolean) as string[];

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <Skeleton variant="rect" className="aspect-[3/2] w-full rounded-sm" />
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rect" className="w-24 h-16" />
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton variant="text" className="h-4 w-32" />
                <Skeleton variant="text" className="h-12 w-64" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                    <Skeleton variant="text" className="h-3 w-20 mb-2" />
                    <Skeleton variant="text" className="h-5 w-16" />
                  </div>
                ))}
              </div>
              <Skeleton variant="rect" className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold serif gold-text italic">Vehicle Not Found</h1>
          <p className="text-white/40">{error || `The vehicle with ID '${id}' could not be located.`}</p>
          <Link to="/fleet" className="gold-text uppercase tracking-widest font-bold border border-gold/50 px-6 py-2 hover:bg-gold/10 transition-all">
            Return to Fleet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Images */}
          <div className="space-y-6">
            <div className="aspect-[3/2] overflow-hidden rounded-sm relative shadow-2xl">
              <img 
                src={galleryImages[activeImageIndex] || 'https://via.placeholder.com/800x600?text=No+Image'} 
                alt={vehicle.model} 
                className="w-full h-full object-cover transition-opacity duration-300"
                key={activeImageIndex} // Force re-render for transition
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((img, i) => (
                <div 
                  key={i}
                  className={`aspect-[3/2] overflow-hidden rounded-sm cursor-pointer border-2 transition-all ${i === activeImageIndex ? 'gold-border' : 'border-transparent hover:border-white/20'}`}
                  onClick={() => setActiveImageIndex(i)}
                >
                    <img src={img} alt={`${vehicle.model} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Right Side: Info & Booking */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-[10px] uppercase tracking-widest gold-bg text-black px-2 py-0.5 font-bold">{vehicle.category}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">Vehicle ID: {vehicle.id}</span>
              </div>
              <h1 className="text-6xl font-bold serif leading-tight">{vehicle.make} <br /><span className="gold-text italic">{vehicle.model}</span></h1>
              <p className="text-white/40 text-sm tracking-widest uppercase">Model Year {vehicle.year}</p>
            </div>

            <div className="grid grid-cols-2 gap-12 border-y border-white/10 py-10">
              <div className="space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Engine</p>
                  <p className="text-lg font-semibold">{vehicle.engine}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Power</p>
                  <p className="text-lg font-semibold">{vehicle.horsepower} BHP</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">0-60 MPH</p>
                  <p className="text-lg font-semibold">{vehicle.zeroToSixty}</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Transmission</p>
                  <p className="text-lg font-semibold">{vehicle.transmission}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Seats</p>
                  <p className="text-lg font-semibold">{vehicle.seats} Passengers</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Top Speed</p>
                  <p className="text-lg font-semibold">{vehicle.topSpeed}</p>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-sm space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Base Daily Rate</p>
                  <p className="text-4xl font-bold gold-text">${vehicle.pricePerDay}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Security Deposit</p>
                  <p className="text-lg font-semibold">$5,000</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/10">
                <button 
                  onClick={() => navigate('/booking', { state: { vehicleId: vehicle.id } })}
                  className="w-full gold-bg text-black py-5 font-bold uppercase tracking-[0.2em] text-sm hover:brightness-110 transition-all"
                >
                  Proceed to Reservation
                </button>
                <p className="text-[10px] text-center text-white/30 uppercase tracking-widest">Insurance and VAT calculated at checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specs Tabbed View */}
        <div className="mt-24 space-y-8">
          <h2 className="text-3xl font-bold serif">Features & Amenities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Performance', items: ['Launch Control', 'Active Suspension', 'Carbon Ceramic Brakes', 'Sport Exhaust'] },
              { title: 'Interior', items: ['Premium Nappa Leather', 'Heated & Cooled Seats', 'Ambient Lighting', 'Soft Close Doors'] },
              { title: 'Technology', items: ['Apple CarPlay', '360° Surround View', 'Burmester Surround Sound', 'Head-up Display'] },
            ].map((section, idx) => (
              <div key={idx} className="p-8 border border-white/5 bg-white/[0.02]">
                <h4 className="text-xs uppercase tracking-widest gold-text font-bold mb-6">{section.title}</h4>
                <ul className="space-y-4">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-sm text-white/50">
                      <svg className="w-4 h-4 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
