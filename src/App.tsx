
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Fleet from './pages/Fleet';
import VehicleDetail from './pages/VehicleDetail';
import Login from './pages/Login';
import BookingFlow from './pages/BookingFlow';
import Dashboard from './pages/DashBoard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFleet from './pages/admin/AdminFleet';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCustomers from './pages/admin/AdminCustomer';
import AdminFinance from './pages/admin/AdminFinance';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import SignUp from './pages/Signup';
import ContactUs from './pages/ContactUs';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Customer Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/booking" element={<BookingFlow />} />
          <Route path="/account" element={<Dashboard />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Route>

        {/* Standalone Auth Routes (No Header/Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="fleet" element={<AdminFleet />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="finance" element={<AdminFinance />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
