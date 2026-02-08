
import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import type { BackendBooking, Vehicle } from '../../types';
import Skeleton, { SkeletonTable } from '../../components/Skeleton';

interface BookingWithVehicle extends BackendBooking {
  vehicleData?: Vehicle | null;
}

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await ApiService.getBookings();
      
      // Fetch vehicle details for each booking
      const bookingsWithVehicles = await Promise.all(
        data.map(async (booking: BackendBooking) => {
          try {
            const vehicleData = await ApiService.getVehicleById(String(booking.vehicle_id));
            return { ...booking, vehicleData };
          } catch (err) {
            console.error(`Failed to fetch vehicle ${booking.vehicle_id}:`, err);
            return { ...booking, vehicleData: null };
          }
        })
      );
      
      setBookings(bookingsWithVehicles);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await ApiService.updateBookingStatus(id, newStatus);
      // Update local state
      setBookings(prev => 
        prev.map(b => b.id === id ? { ...b, status: newStatus as BackendBooking['status'] } : b)
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
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

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton variant="text" className="h-8 w-48" />
            <Skeleton variant="text" className="h-4 w-64" />
          </div>
          <div className="flex space-x-2">
            <Skeleton variant="rect" className="h-10 w-32" />
            <Skeleton variant="rect" className="h-10 w-24" />
          </div>
        </div>
        <SkeletonTable rows={8} columns={8} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reservation Log</h2>
          <p className="text-sm text-gray-500">Track and manage active customer bookings.</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-[#d4af37]"
          >
            <option value="ALL">All Bookings</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button 
            onClick={fetchBookings}
            className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No bookings found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
                <th className="px-6 py-4 text-left">Booking Ref</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Vehicle</th>
                <th className="px-6 py-4 text-left">Duration</th>
                <th className="px-6 py-4 text-left">Revenue</th>
                <th className="px-6 py-4 text-left">Payment</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map(booking => {
                const vehicle = booking.vehicleData;
                const pickupDate = new Date(booking.pickup_date).toLocaleDateString();
                const returnDate = new Date(booking.return_date).toLocaleDateString();

                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-6 text-sm font-bold text-blue-600">{booking.booking_reference}</td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-gray-800">{booking.driver_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{booking.driver_email}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-3">
                        {vehicle?.image && (
                          <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} className="w-10 h-10 rounded object-cover border border-gray-200" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-800">{vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{vehicle?.year || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm text-gray-600">{pickupDate}</p>
                      <p className="text-xs text-gray-400">to {returnDate}</p>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-gray-800">${Number(booking.total_price).toLocaleString()}</td>
                    <td className="px-6 py-6">
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${
                        booking.payment_status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {booking.payment_status === 'PAID' ? 'Paid' : 'Pay at Pickup'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                          className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full border-0 cursor-pointer ${getStatusColor(booking.status)}`}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="ACTIVE">Active</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
