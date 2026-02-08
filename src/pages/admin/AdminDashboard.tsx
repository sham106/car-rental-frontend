
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ApiService } from '../../services/api';
import Skeleton, { SkeletonStats, SkeletonChart } from '../../components/Skeleton';

interface DashboardStats {
  todayRevenue: number;
  activeRentals: number;
  fleetUtilization: number;
  pendingApprovals: number;
}

interface RecentBooking {
  id: number;
  booking_reference: string;
  vehicle_id: number;
  pickup_date: string;
  total_price: number;
  status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    activeRentals: 0,
    fleetUtilization: 0,
    pendingApprovals: 0,
  });
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all bookings
      const bookingsData = await ApiService.getBookings();
      setBookings(bookingsData);

      // Fetch vehicles for fleet utilization
      const vehiclesData = await ApiService.getVehicles();
      setVehicles(vehiclesData);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      
      // Today's revenue
      const todayBookings = bookingsData.filter((b: any) => 
        b.created_at && b.created_at.split('T')[0] === today && 
        b.payment_status === 'PAID'
      );
      const todayRevenue = todayBookings.reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0);

      // Active rentals
      const activeRentals = bookingsData.filter((b: any) => 
        b.status === 'ACTIVE'
      ).length;

      // Pending approvals (new bookings)
      const pendingApprovals = bookingsData.filter((b: any) => 
        b.status === 'PENDING'
      ).length;

      // Fleet utilization
      const availableVehicles = vehiclesData.filter((v: any) => 
        v.availability === 'Available'
      ).length;
      const fleetUtilization = vehiclesData.length > 0 
        ? Math.round(((vehiclesData.length - availableVehicles) / vehiclesData.length) * 100)
        : 0;

      setStats({
        todayRevenue,
        activeRentals,
        fleetUtilization,
        pendingApprovals,
      });

      // Generate weekly revenue data from bookings
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const weeklyData = last7Days.map(date => {
        const dayBookings = bookingsData.filter((b: any) => 
          b.created_at && b.created_at.split('T')[0] === date && b.payment_status === 'PAID'
        );
        const dayRevenue = dayBookings.reduce((sum: number, b: any) => sum + Number(b.total_price || 0), 0);
        return {
          date,
          revenue: dayRevenue,
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        };
      });

      setRevenueData(weeklyData);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-600';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-600';
      case 'ACTIVE': return 'bg-green-100 text-green-600';
      case 'COMPLETED': return 'bg-gray-100 text-gray-600';
      case 'CANCELLED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <Skeleton variant="text" className="h-6 w-40" />
          </div>
          <div className="p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-0">
                <Skeleton variant="rect" className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-32" />
                  <Skeleton variant="text" className="h-3 w-24" />
                </div>
                <Skeleton variant="text" className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    { name: "Today's Revenue", value: formatCurrency(stats.todayRevenue), change: '+0%', color: 'blue' },
    { name: 'Active Rentals', value: stats.activeRentals.toString(), change: '+0', color: 'green' },
    { name: 'Fleet Utilization', value: `${stats.fleetUtilization}%`, change: '+0%', color: 'purple' },
    { name: 'Pending Approvals', value: stats.pendingApprovals.toString(), change: '-0', color: 'orange' },
  ];

  // Get recent bookings (last 5)
  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between">
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">{stat.name}</p>
            <div className="mt-2 flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
              <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-gray-400'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800">Weekly Revenue Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.length > 0 ? revenueData : [
                { name: 'Mon', revenue: 0 },
                { name: 'Tue', revenue: 0 },
                { name: 'Wed', revenue: 0 },
                { name: 'Thu', revenue: 0 },
                { name: 'Fri', revenue: 0 },
                { name: 'Sat', revenue: 0 },
                { name: 'Sun', revenue: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="revenue" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800">Booking Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData.length > 0 ? revenueData : [
                { name: 'Mon', revenue: 0 },
                { name: 'Tue', revenue: 0 },
                { name: 'Wed', revenue: 0 },
                { name: 'Thu', revenue: 0 },
                { name: 'Fri', revenue: 0 },
                { name: 'Sat', revenue: 0 },
                { name: 'Sun', revenue: 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="revenue" stroke="#2ecc71" strokeWidth={3} dot={{r: 4, fill: '#2ecc71', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Real-time Activity</h3>
          <button className="text-blue-500 text-xs font-bold hover:underline">View All Activities</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              <th className="px-6 py-4 text-left">Event</th>
              <th className="px-6 py-4 text-left">Entity</th>
              <th className="px-6 py-4 text-left">Timestamp</th>
              <th className="px-6 py-4 text-left">Value</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  No recent bookings
                </td>
              </tr>
            ) : (
              recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">New Reservation</td>
                  <td className="px-6 py-4 text-sm text-gray-500">Vehicle #{booking.vehicle_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(booking.created_at)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatCurrency(Number(booking.total_price))}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
