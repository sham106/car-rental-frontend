
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import type { BackendBooking, Vehicle } from '../types';
import Skeleton from '../components/Skeleton';

interface BookingWithVehicle extends BackendBooking {
  vehicleData?: Vehicle | null;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingWithVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await ApiService.getMe();
      setUser(userData);
      
      // Fetch user bookings
      const bookingsData = await ApiService.getBookings();
      
      // Fetch vehicle details for each booking
      const bookingsWithVehicles = await Promise.all(
        bookingsData.map(async (booking: BackendBooking) => {
          try {
            const vehicleData = await ApiService.getVehicleById(String(booking.vehicle_id));
            return { ...booking, vehicleData };
          } catch (error) {
            console.error(`Failed to fetch vehicle ${booking.vehicle_id}:`, error);
            return { ...booking, vehicleData: null };
          }
        })
      );
      
      setBookings(bookingsWithVehicles);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-600';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-600';
      case 'ACTIVE': return 'bg-green-100 text-green-600';
      case 'COMPLETED': return 'bg-gray-100 text-gray-600';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Build user name from first_name and last_name
  const displayName = user 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email.split('@')[0]
    : 'Guest';

  const membershipTier = user?.membership_tier || 'Silver';
  const points = user?.points || 0;

  // Filter bookings based on active tab
  const activeBookings = bookings.filter(b => ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status));
  const historyBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status));
  const displayedBookings = activeTab === 'active' ? activeBookings : historyBookings;

  if (isLoading) {
    return (
      <div className="pt-32 pb-24 bg-[#0a0a0a] min-h-screen">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-8">
              <div className="glass p-8 rounded-sm space-y-6">
                <div className="flex items-center space-x-6">
                  <Skeleton variant="circle" className="w-20 h-20" />
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-8 w-40" />
                    <Skeleton variant="text" className="h-4 w-24" />
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <Skeleton variant="text" className="h-4 w-32" />
                  <Skeleton variant="rect" className="h-1 w-full" />
                  <Skeleton variant="text" className="h-3 w-48" />
                </div>
              </div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rect" className="h-12 w-full" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-12">
              <Skeleton variant="text" className="h-10 w-64" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass p-6 flex flex-col md:flex-row gap-8 items-center rounded-sm">
                  <Skeleton variant="rect" className="w-full md:w-48 aspect-[3/2]" />
                  <div className="flex-grow space-y-4 w-full">
                    <Skeleton variant="text" className="h-6 w-48" />
                    <Skeleton variant="text" className="h-4 w-32" />
                    <Skeleton variant="rect" className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* User Profile Summary */}
          <div className="space-y-8">
            <div className="glass p-8 rounded-sm space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 gold-bg text-black text-3xl font-bold rounded-full flex items-center justify-center serif uppercase">
                  {displayName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold serif capitalize">{displayName}</h2>
                  <p className="text-xs text-white/40 tracking-widest uppercase">{membershipTier} Member</p>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Luxe Points</span>
                  <span className="text-xl font-bold gold-text">{points.toLocaleString()}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full gold-bg w-3/4"></div>
                </div>
                <p className="text-[8px] uppercase tracking-widest text-white/20 text-center">4,600 points until Black Tier status</p>
              </div>
              
              {/* License Image Display */}
              {user?.license_image_url && (
                <div className="pt-6 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold block mb-3">License on File</span>
                  <div className="relative group">
                    <img 
                      src={user.license_image_url} 
                      alt="Driver's License"
                      className="w-full h-32 object-cover rounded-sm border border-white/10"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] uppercase tracking-widest text-white">View License</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] gold-text font-bold">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-3">
                <button className="text-left p-4 bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/5 text-[10px] uppercase tracking-widest font-bold">Modify Profile</button>
                <button className="text-left p-4 bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/5 text-[10px] uppercase tracking-widest font-bold">Payment Methods</button>
                <button className="text-left p-4 bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/5 text-[10px] uppercase tracking-widest font-bold">Loyalty Rewards</button>
                <button 
                  onClick={handleLogout}
                  className="text-left p-4 bg-white/[0.03] hover:bg-white/[0.08] transition-all border border-white/5 text-[10px] uppercase tracking-widest font-bold text-red-500/80"
                >
                  Logout Session
                </button>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-3xl font-bold serif">My <span className="gold-text italic">Reservations</span></h3>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setActiveTab('active')}
                    className={`text-[10px] uppercase tracking-widest font-bold pb-1 transition-all ${activeTab === 'active' ? 'gold-text border-b border-[#d4af37]' : 'text-white/30 hover:text-white'}`}
                  >Active</button>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`text-[10px] uppercase tracking-widest font-bold pb-1 transition-all ${activeTab === 'history' ? 'gold-text border-b border-[#d4af37]' : 'text-white/30 hover:text-white'}`}
                  >History</button>
                </div>
              </div>

              <div className="space-y-6">
                {displayedBookings.length === 0 ? (
                  <div className="glass p-8 text-center rounded-sm">
                    <p className="text-white/40 text-sm uppercase tracking-widest">
                      {activeTab === 'active' ? 'No active reservations' : 'No booking history'}
                    </p>
                    <button 
                      onClick={() => navigate('/fleet')}
                      className="mt-4 gold-text uppercase tracking-[0.3em] font-bold text-[10px] border border-[#d4af37] px-6 py-2 hover:bg-[#d4af37] hover:text-black transition-all"
                    >
                      Book a Vehicle
                    </button>
                  </div>
                ) : (
                  displayedBookings.map(booking => {
                    const vehicle = booking.vehicleData;
                    return (
                      <div key={booking.id} className="glass p-6 flex flex-col md:flex-row gap-8 items-center rounded-sm group hover:border-[#d4af37]/30 transition-all">
                        <div className="w-full md:w-48 aspect-[3/2] overflow-hidden rounded-sm">
                          <img 
                            src={vehicle?.image || 'https://picsum.photos/400/300'} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt={vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                          />
                        </div>
                        <div className="flex-grow space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border font-bold rounded-sm mb-2 inline-block ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                              <h4 className="text-xl font-bold serif">{vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle'}</h4>
                              <p className="text-[10px] uppercase tracking-widest text-white/40">Ref: {booking.booking_reference}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold gold-text">${Number(booking.total_price).toLocaleString()}</p>
                              <p className="text-[9px] uppercase tracking-widest text-white/30">Total Value</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-12 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Pick-up</p>
                              <p className="text-xs">{new Date(booking.pickup_date).toLocaleDateString()}</p>
                            </div>
                            <div className="w-[1px] h-6 bg-white/10"></div>
                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-1">Return</p>
                              <p className="text-xs">{new Date(booking.return_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-12 border border-dashed border-white/10 text-center rounded-sm bg-white/[0.01]">
              <h4 className="text-lg font-bold serif mb-2">New Journey?</h4>
              <p className="text-xs text-white/40 uppercase tracking-widest mb-6 leading-relaxed">Your next exquisite experience is just a selection away.</p>
              <button 
                onClick={() => navigate('/fleet')}
                className="gold-text uppercase tracking-[0.3em] font-bold text-[10px] border border-[#d4af37] px-8 py-3 hover:bg-[#d4af37] hover:text-black transition-all"
              >
                Browse Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
