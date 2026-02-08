
export const VehicleCategory = {
  CLASSIC: 'Classic',
  EXOTIC: 'Exotic',
  SPORT: 'Sport',
  SUV: 'SUV',
} as const;

export type VehicleCategory = (typeof VehicleCategory)[keyof typeof VehicleCategory];

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: VehicleCategory;
  pricePerDay: number;
  image: string; // Primary image
  gallery: string[]; // Additional gallery images
  transmission: 'Automatic' | 'Manual';
  seats: number;
  engine: string;
  horsepower: number;
  zeroToSixty: string;
  topSpeed: string;
  availability: 'Available' | 'Rented' | 'Maintenance';
}

export interface Booking {
  id: string;
  vehicleId: string;
  customerName: string;
  pickupDate: string;
  returnDate: string;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  totalAmount: number;
}

export interface BackendBooking {
  id: number;
  user: number;
  vehicle_id: number;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  driver_name: string;
  driver_email: string;
  driver_phone: string;
  license_number: string;
  enhancements: string[];
  base_price: number;
  enhancements_price: number;
  total_price: number;
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED';
  payment_method: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  booking_reference: string;
  created_at: string;
}

export interface User {
  name: string;
  email: string;
  membershipTier: 'Silver' | 'Gold' | 'Platinum' | 'Black';
  points: number;
}
