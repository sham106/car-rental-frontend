
import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import Skeleton, { SkeletonTable } from '../../components/Skeleton';

interface BackendUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  license_number: string;
  membership_tier: string;
  points: number;
  date_joined: string;
}

interface UserDetail {
  user: BackendUser;
  bookings: Array<{
    id: number;
    booking_reference: string;
    vehicle_id: number;
    pickup_date: string;
    return_date: string;
    driver_name: string;
    driver_email: string;
    driver_phone: string;
    license_number: string;
    license_image: string | null;
    total_price: number;
    status: string;
    payment_status: string;
    created_at: string;
  }>;
  total_bookings: number;
  total_spent: number;
}

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UserDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await ApiService.getUsers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerDetail = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const data = await ApiService.getUserDetail(id);
      console.log('Customer detail data:', data);
      console.log('Bookings:', data.bookings);
      console.log('License images in bookings:', data.bookings?.map((b: any) => ({ id: b.id, license_image: b.license_image })));
      setSelectedCustomer(data);
    } catch (err: any) {
      alert('Failed to fetch customer details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getLicenseImageSection = (bookings: UserDetail['bookings']) => {
    if (bookings.length === 0) {
      return null;
    }
    const bookingWithLicense = bookings.find((b) => b.license_image);
    console.log('Booking with license:', bookingWithLicense);
    if (!bookingWithLicense?.license_image) {
      console.log('No license image found in any booking');
      return (
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Driver's License</p>
          <p className="text-gray-400 text-sm">No license image uploaded</p>
        </div>
      );
    }

    // Ensure the image URL is absolute. If it's a relative path from Django (e.g. /media/...), prepend the backend URL.
    const imageUrl = bookingWithLicense.license_image.startsWith('http') 
      ? bookingWithLicense.license_image 
      : `http://localhost:8000${bookingWithLicense.license_image}`;

    return (
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Driver's License</p>
        <a 
          href={imageUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block"
        >
          <img 
            src={imageUrl} 
            alt="Driver's License"
            className="max-w-xs max-h-48 object-contain rounded-lg border border-gray-200 hover:border-[#d4af37] transition-colors"
          />
        </a>
        <p className="text-xs text-[#d4af37] mt-2">Click to view full size</p>
      </div>
    );
  };

  const filteredCustomers = customers.filter(c => {
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || c.email.toLowerCase().includes(search) || c.id.toString().includes(search);
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BLACK': return 'bg-gray-900 text-white';
      case 'PLATINUM': return 'bg-blue-100 text-blue-700';
      case 'GOLD': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
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

  const formatTier = (tier: string) => {
    return tier.charAt(0) + tier.slice(1).toLowerCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton variant="text" className="h-8 w-64" />
            <Skeleton variant="text" className="h-4 w-48 mt-2" />
          </div>
          <Skeleton variant="rect" className="h-10 w-40" />
        </div>
        <Skeleton variant="rect" className="h-12 w-full" />
        <SkeletonTable rows={5} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Customer Relations</h2>
          <p className="text-sm text-gray-500">Manage your elite membership base and tracking interactions.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all">
          New Member Application
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by name, email or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <svg className="w-4 h-4 absolute left-3 text-gray-400 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No customers found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Contact</th>
                <th className="px-6 py-4 text-left">Tier</th>
                <th className="px-6 py-4 text-center">Points</th>
                <th className="px-6 py-4 text-left">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map(customer => {
                const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown';
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {fullName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{fullName}</p>
                          <p className="text-[10px] text-gray-400">ID: {customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      <p className="text-xs text-gray-400">{customer.phone_number || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full ${getTierColor(customer.membership_tier)}`}>
                        {formatTier(customer.membership_tier)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-800">
                      {customer.points.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(customer.date_joined)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => fetchCustomerDetail(customer.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-widest"
                      >
                        View Profile
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {isDetailLoading ? (
              <div className="p-12 space-y-6">
                <div className="flex items-center space-x-6">
                  <Skeleton variant="circle" className="w-20 h-20" />
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-6 w-40" />
                    <Skeleton variant="text" className="h-4 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Skeleton variant="rect" className="h-24" />
                  <Skeleton variant="rect" className="h-24" />
                </div>
                <Skeleton variant="rect" className="h-48 w-full" />
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedCustomer.user.first_name} {selectedCustomer.user.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.user.email}</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full ${getTierColor(selectedCustomer.user.membership_tier)}`}>
                      {formatTier(selectedCustomer.user.membership_tier)}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Contact Information</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Phone</p>
                        <p className="text-gray-800">
                          {selectedCustomer.bookings.length > 0 
                            ? (selectedCustomer.bookings[0].driver_phone || 'Not provided')
                            : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Email</p>
                        <p className="text-gray-800">{selectedCustomer.user.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">License Number</p>
                        <p className="text-gray-800">
                          {selectedCustomer.bookings.length > 0 
                            ? (selectedCustomer.bookings[0].license_number || 'Not provided')
                            : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Member Since</p>
                        <p className="text-gray-800">{formatDate(selectedCustomer.user.date_joined)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">Points Balance</p>
                        <p className="text-gray-800">{selectedCustomer.user.points.toLocaleString()}</p>
                      </div>
                      {getLicenseImageSection(selectedCustomer.bookings)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Booking Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-800">{selectedCustomer.total_bookings}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Total Bookings</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">${selectedCustomer.total_spent.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Total Spent</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4">Booking History</h4>
                  {selectedCustomer.bookings.length === 0 ? (
                    <p className="text-gray-400 text-sm">No bookings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCustomer.bookings.map(booking => (
                          <div key={booking.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-bold text-gray-800">{booking.booking_reference}</p>
                                <p className="text-sm text-gray-600">Vehicle ID: {booking.vehicle_id}</p>
                              </div>
                              <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold rounded-full ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-2">
                              <div>
                                <p className="text-xs text-gray-400">Pickup - Return</p>
                                <p>{formatDate(booking.pickup_date)} - {formatDate(booking.return_date)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Phone</p>
                                <p>{booking.driver_phone || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <div className="text-gray-500">
                                <p className="text-xs text-gray-400">Driver</p>
                                <p>{booking.driver_name}</p>
                              </div>
                              <span className="font-bold text-gray-800">${booking.total_price.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
