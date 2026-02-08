
import React from 'react';
import { Link } from 'react-router-dom';
import { type Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  return (
    <div className="group relative bg-[#1a1a1a] border border-white/10 overflow-hidden rounded-sm transition-all duration-500 hover:border-[#d4af37]/50 shadow-2xl">
      <div className="aspect-[3/2] overflow-hidden relative">
        <img 
          src={vehicle.image} 
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60"></div>
        <div className="absolute top-4 left-4">
          <span className="text-[10px] uppercase tracking-widest gold-bg text-black font-bold px-2 py-1 rounded-sm">
            {vehicle.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold serif group-hover:gold-text transition-colors">{vehicle.make} {vehicle.model}</h3>
            <p className="text-white/40 text-xs uppercase tracking-widest">{vehicle.year}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold gold-text">${vehicle.pricePerDay}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Per Day</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6 text-[10px] uppercase tracking-widest text-white/50">
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{vehicle.horsepower} HP</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{vehicle.zeroToSixty}</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-3 h-3 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{vehicle.seats} Seats</span>
          </div>
        </div>

        <Link 
          to={`/vehicle/${vehicle.id}`}
          className="block w-full text-center border border-white/20 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-white hover:text-black transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;
