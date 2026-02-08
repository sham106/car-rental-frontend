
import { type Vehicle, VehicleCategory, type Booking } from './types';

export const VEHICLES: Vehicle[] = [
  {
    id: '1',
    make: 'Aston Martin',
    model: 'DB11',
    year: 2023,
    category: VehicleCategory.EXOTIC,
    pricePerDay: 1200,
    image: 'https://picsum.photos/id/111/800/600',
    gallery: [],
    transmission: 'Automatic',
    seats: 4,
    engine: '5.2L V12',
    horsepower: 630,
    zeroToSixty: '3.7s',
    topSpeed: '208 mph',
    availability: 'Available'
  },
  {
    id: '2',
    make: 'Lamborghini',
    model: 'Huracán EVO',
    year: 2024,
    category: VehicleCategory.SPORT,
    pricePerDay: 1800,
    image: 'https://picsum.photos/id/183/800/600',
    gallery: [],
    transmission: 'Automatic',
    seats: 2,
    engine: '5.2L V10',
    horsepower: 640,
    zeroToSixty: '2.9s',
    topSpeed: '202 mph',
    availability: 'Available'
  },
  {
    id: '3',
    make: 'Rolls-Royce',
    model: 'Ghost',
    year: 2023,
    category: VehicleCategory.EXOTIC,
    pricePerDay: 2500,
    image: 'https://picsum.photos/id/211/800/600',
    gallery: [],
    transmission: 'Automatic',
    seats: 5,
    engine: '6.75L V12',
    horsepower: 563,
    zeroToSixty: '4.6s',
    topSpeed: '155 mph',
    availability: 'Available'
  },
  {
    id: '4',
    make: 'Porsche',
    model: '911 Turbo S',
    year: 2024,
    category: VehicleCategory.SPORT,
    pricePerDay: 1400,
    image: 'https://picsum.photos/id/1071/800/600',
    gallery: [],
    transmission: 'Automatic',
    seats: 4,
    engine: '3.7L Flat-6',
    horsepower: 640,
    zeroToSixty: '2.6s',
    topSpeed: '205 mph',
    availability: 'Available'
  },
  {
    id: '5',
    make: 'Land Rover',
    model: 'Range Rover Autobiography',
    year: 2024,
    category: VehicleCategory.SUV,
    pricePerDay: 850,
    image: 'https://picsum.photos/id/1072/800/600',
    gallery: [],
    transmission: 'Automatic',
    seats: 5,
    engine: '4.4L V8',
    horsepower: 523,
    zeroToSixty: '4.4s',
    topSpeed: '155 mph',
    availability: 'Available'
  },
  {
    id: '6',
    make: 'Jaguar',
    model: 'E-Type Series 1',
    year: 1961,
    category: VehicleCategory.CLASSIC,
    pricePerDay: 2200,
    image: 'https://picsum.photos/id/133/800/600',
    gallery: [],
    transmission: 'Manual',
    seats: 2,
    engine: '3.8L Straight-6',
    horsepower: 265,
    zeroToSixty: '6.4s',
    topSpeed: '150 mph',
    availability: 'Available'
  }
];

export const RECENT_BOOKINGS: Booking[] = [
  {
    id: 'BK-9021',
    vehicleId: '1',
    customerName: 'Julian Sterling',
    pickupDate: '2024-06-15',
    returnDate: '2024-06-18',
    status: 'Upcoming',
    totalAmount: 3600
  },
  {
    id: 'BK-8842',
    vehicleId: '2',
    customerName: 'Elena Vance',
    pickupDate: '2024-06-10',
    returnDate: '2024-06-12',
    status: 'Active',
    totalAmount: 3600
  }
];

export const CUSTOMERS = [
  { id: 'C-001', name: 'Julian Sterling', email: 'j.sterling@executive.com', phone: '+971 50 123 4567', tier: 'Platinum', bookings: 12, spent: 45000 },
  { id: 'C-002', name: 'Elena Vance', email: 'elena.v@tech.io', phone: '+971 55 987 6543', tier: 'Black', bookings: 24, spent: 128000 },
  { id: 'C-003', name: 'Marcus Chen', email: 'm.chen@venture.cap', phone: '+1 212 555 0198', tier: 'Gold', bookings: 5, spent: 12500 },
  { id: 'C-004', name: 'Sofia Rodriguez', email: 'sofia@art.gallery', phone: '+34 600 123 456', tier: 'Silver', bookings: 2, spent: 4800 },
  { id: 'C-005', name: 'James Montgomery', email: 'j.monty@law.firm', phone: '+44 20 7946 0000', tier: 'Platinum', bookings: 8, spent: 22400 },
];

export const TRANSACTIONS = [
  { id: 'TX-771', date: '2024-06-15', bookingId: 'BK-9021', customer: 'Julian Sterling', amount: 3600, method: 'Visa Platinum', status: 'Paid' },
  { id: 'TX-770', date: '2024-06-14', bookingId: 'BK-8840', customer: 'Sarah Jenkins', amount: 1200, method: 'Apple Pay', status: 'Paid' },
  { id: 'TX-769', date: '2024-06-13', bookingId: 'BK-8839', customer: 'Elena Vance', amount: 7500, method: 'Amex Centurion', status: 'Paid' },
  { id: 'TX-768', date: '2024-06-12', bookingId: 'BK-8838', customer: 'Marcus Chen', amount: 2400, method: 'Mastercard', status: 'Refunded' },
  { id: 'TX-767', date: '2024-06-11', bookingId: 'BK-8837', customer: 'James Montgomery', amount: 4800, method: 'Bank Transfer', status: 'Paid' },
];
