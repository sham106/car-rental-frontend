
import { type Vehicle, type BackendBooking } from '../types';

// Use environment variable for production, fallback to relative path for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const VEHICLE_TO_BACKEND_KEYS: Record<string, string> = {
  make: 'make',
  model: 'model',
  year: 'year',
  category: 'category',
  pricePerDay: 'price_per_day',
  image: 'image',
  gallery: 'gallery',
  transmission: 'transmission',
  seats: 'seats',
  engine: 'engine',
  horsepower: 'horsepower',
  zeroToSixty: 'zero_to_sixty',
  topSpeed: 'top_speed',
  availability: 'availability',
};

/** Backend expects snake_case; convert vehicle payload for create/update (only model fields) */
function vehicleToBackend(data: Partial<Vehicle>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    // Skip undefined, null, and empty strings for optional fields
    if (value === undefined || value === null) continue;
    // Skip empty strings for optional text fields (but keep them for required fields)
    if (value === '' && ['engine', 'zeroToSixty', 'topSpeed', 'image'].includes(key)) continue;
    
    const backendKey = VEHICLE_TO_BACKEND_KEYS[key];
    if (backendKey) {
      // Ensure numeric fields are numbers
      if (['year', 'seats', 'horsepower'].includes(key) && typeof value === 'string') {
        out[backendKey] = parseInt(value, 10) || 0;
      } else if (key === 'pricePerDay') {
        // Ensure price_per_day is a number (DecimalField accepts number)
        out[backendKey] = typeof value === 'string' ? parseFloat(value) || 0 : value;
      } else {
        out[backendKey] = value;
      }
    }
  }
  return out;
}

/** API returns snake_case; convert to frontend camelCase */
function vehicleFromBackend(raw: Record<string, unknown>): Vehicle {
  return {
    id: raw.id != null ? String(raw.id) : '',
    make: raw.make as string,
    model: raw.model as string,
    year: raw.year as number,
    category: raw.category as Vehicle['category'],
    pricePerDay: Number((raw as { price_per_day?: number }).price_per_day ?? 0),
    image: (raw.image as string) ?? '',
    gallery: Array.isArray(raw.gallery) ? (raw.gallery as string[]) : [],
    transmission: (raw.transmission as Vehicle['transmission']) ?? 'Automatic',
    seats: Number(raw.seats ?? 2),
    engine: (raw.engine as string) ?? '',
    horsepower: Number(raw.horsepower ?? 0),
    zeroToSixty: ((raw as { zero_to_sixty?: string }).zero_to_sixty as string) ?? '',
    topSpeed: ((raw as { top_speed?: string }).top_speed as string) ?? '',
    availability: (raw.availability as Vehicle['availability']) ?? 'Available',
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  license_image_url?: string;
}

export class ApiService {
  private static getHeaders() {
    // Support both keys: Login.tsx uses access_token, ApiService.login uses luxe_token
    const token = localStorage.getItem('luxe_token') || localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  // Auth
  static async login(credentials: any): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Authentication Failed');
    const data = await response.json();
    const access = data.access || data.token || data.key;
    if (access) {
      localStorage.setItem('luxe_token', access);
      localStorage.setItem('access_token', access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
    }
    return data;
  }

  static async register(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Registration Failed');
    return response.json();
  }

  static async getMe(): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/me/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  }

  // Fleet CRUD with optional limit
  static async getVehicles(limit?: number): Promise<Vehicle[]> {
    let url = `${API_BASE_URL}/vehicles/`;
    if (limit && limit > 0) {
      url += `?limit=${limit}`;
    }
    let response: Response;
    try {
      response = await fetch(url, {
        headers: this.getHeaders(),
      });
    } catch (networkErr: any) {
      throw new Error(`Cannot reach server (${API_BASE_URL}). Is the backend running? ${networkErr?.message || ''}`);
    }
    if (!response.ok) {
      const body = await response.text();
      let detail = body;
      try {
        const json = JSON.parse(body);
        detail = json.detail || json.message || body;
      } catch {
        if (!body) detail = `HTTP ${response.status}`;
      }
      throw new Error(`Failed to fetch fleet: ${response.status} ${detail}`);
    }
    const list = await response.json();
    // Handle both paginated response and regular array
    if (Array.isArray(list)) {
      return list.map((v: Record<string, unknown>) => vehicleFromBackend(v));
    }
    // Handle paginated response structure
    const results = (list as Record<string, unknown>).results;
    if (Array.isArray(results)) {
      return results.map((v: Record<string, unknown>) => vehicleFromBackend(v));
    }
    return [];
  }

  static async getVehicleCount(): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/count/`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch count');
      const data = await response.json();
      return data.count as number;
    } catch {
      // Fallback: return 0 if endpoint doesn't exist
      return 0;
    }
  }

  static async getVehicleById(id: string): Promise<Vehicle> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Vehicle not found');
    const raw = await response.json();
    return vehicleFromBackend(raw);
  }

  static async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    const body = vehicleToBackend(data);
    const response = await fetch(`${API_BASE_URL}/vehicles/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail || errorData.message || 
        (typeof errorData === 'object' && Object.keys(errorData).length > 0 
          ? JSON.stringify(errorData) 
          : 'Failed to create asset');
      throw new Error(errorMsg);
    }
    const raw = await response.json();
    return vehicleFromBackend(raw);
  }

  static async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const body = vehicleToBackend(data);
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail || errorData.message || 
        (typeof errorData === 'object' && Object.keys(errorData).length > 0 
          ? JSON.stringify(errorData) 
          : 'Failed to update asset');
      throw new Error(errorMsg);
    }
    const raw = await response.json();
    return vehicleFromBackend(raw);
  }

  static async deleteVehicle(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail || errorData.message || 'Failed to delete asset';
      throw new Error(errorMsg);
    }
  }

  // Bookings
  static async getBookings(): Promise<BackendBooking[]> {
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  }

  static async createBooking(data: {
    vehicle_id: number;
    pickup_date: string;
    return_date: string;
    pickup_location: string;
    return_location: string;
    driver_name: string;
    driver_email: string;
    driver_phone: string;
    license_number: string;
    license_image?: File;
    enhancements: string;
    base_price: number;
    enhancements_price: number;
    total_price: number;
  }): Promise<BackendBooking> {
    const formData = new FormData();
    formData.append('vehicle_id', String(data.vehicle_id));
    formData.append('pickup_date', data.pickup_date);
    formData.append('return_date', data.return_date);
    formData.append('pickup_location', data.pickup_location);
    formData.append('return_location', data.return_location);
    formData.append('driver_name', data.driver_name);
    formData.append('driver_email', data.driver_email);
    formData.append('driver_phone', data.driver_phone);
    formData.append('license_number', data.license_number);
    if (data.license_image) {
      formData.append('license_image', data.license_image);
    }
    formData.append('enhancements', data.enhancements);
    formData.append('base_price', String(data.base_price));
    formData.append('enhancements_price', String(data.enhancements_price));
    formData.append('total_price', String(data.total_price));
    formData.append('payment_method', 'Manual at Pickup');
    formData.append('payment_status', 'PENDING');
    formData.append('status', 'PENDING');
    
    const token = localStorage.getItem('luxe_token') || localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/bookings/`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Reservation failed');
    }
    return response.json();
  }

  static async checkVehicleAvailability(vehicleId: string, pickupDate: string, returnDate: string): Promise<{
    available: boolean;
    message?: string;
    next_available_date?: string;
  }> {
    const params = new URLSearchParams({
      pickup_date: pickupDate,
      return_date: returnDate,
    });
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}/availability/?${params}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to check availability');
    }
    return response.json();
  }

  static async updateBookingStatus(id: number, status: string): Promise<BackendBooking> {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Status update failed');
    return response.json();
  }

  static async getUsers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/auth/users/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  static async getUserDetail(id: number): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/users/${id}/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user details');
    return response.json();
  }
}
