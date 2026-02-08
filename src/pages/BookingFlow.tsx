
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import type { Vehicle } from '../types';

interface FormData {
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  driverName: string;
  driverEmail: string;
  driverPhone: string;
  licenseNumber: string;
  licenseFile: File | null;
  selectedEnhancements: string[];
}

interface TouchedFields {
  driverName: boolean;
  driverEmail: boolean;
  driverPhone: boolean;
  licenseNumber: boolean;
  licenseFile: boolean;
}

interface Enhancement {
  name: string;
  price: number;
  desc: string;
}

const ENHANCEMENTS: Enhancement[] = [
  { name: 'Elite Insurance Coverage', price: 150, desc: 'Zero excess, full protection including glass and tires.' },
  { name: 'Personal Chauffeur', price: 450, desc: 'Professional driver for the duration of your trip (up to 8h/day).' },
  { name: 'Concierge Delivery', price: 100, desc: 'Direct delivery to your hotel or residence.' },
  { name: 'GPS Navigation Pro', price: 25, desc: 'Latest mapping with real-time traffic alerts.' },
];

const BookingFlow: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    driverName: false,
    driverEmail: false,
    driverPhone: false,
    licenseNumber: false,
    licenseFile: false,
  });
  const licenseInputRef = useRef<HTMLInputElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialVehicleId = (location.state as any)?.vehicleId;

  const [formData, setFormData] = useState<FormData>({
    pickupLocation: 'Dubai Marina Showroom',
    returnLocation: 'Same as Pick-up',
    pickupDate: '',
    returnDate: '',
    driverName: '',
    driverEmail: '',
    driverPhone: '',
    licenseNumber: '',
    licenseFile: null,
    selectedEnhancements: [],
  });

  // Get minimum date for datetime-local (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Get minimum return date (same as pickup date)
  const getMinReturnDate = () => {
    if (!formData.pickupDate) return getMinDateTime();
    return formData.pickupDate;
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('luxe_token') || localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    // Fetch vehicle details from backend
    const fetchVehicle = async () => {
      if (!initialVehicleId) {
        setIsLoadingVehicle(false);
        return;
      }

      try {
        const vehicleData = await ApiService.getVehicleById(initialVehicleId);
        setVehicle(vehicleData);
      } catch (err) {
        console.error('Failed to fetch vehicle:', err);
        setError('Failed to load vehicle details');
      } finally {
        setIsLoadingVehicle(false);
      }
    };

    fetchVehicle();
  }, [initialVehicleId]);

  const nextStep = async () => {
    // Validate before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    // Check availability for step 1
    if (step === 1 && vehicle) {
      setIsCheckingAvailability(true);
      setAvailabilityError(null);
      try {
        const availability = await ApiService.checkVehicleAvailability(
          vehicle.id,
          formData.pickupDate,
          formData.returnDate
        );
        
        if (!availability.available) {
          setAvailabilityError(availability.message || 'This vehicle is not available for the selected dates.');
          if (availability.next_available_date) {
            setAvailabilityError(`${availability.message} Next available: ${new Date(availability.next_available_date).toLocaleDateString()}`);
          }
          setIsCheckingAvailability(false);
          return;
        }
      } catch (err: any) {
        console.error('Availability check failed:', err);
        // Continue anyway if check fails
      } finally {
        setIsCheckingAvailability(false);
      }
    }
    
    setTouchedFields({
      driverName: false,
      driverEmail: false,
      driverPhone: false,
      licenseNumber: false,
      licenseFile: false,
    });
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  // Validation for each step
  const validateCurrentStep = (): boolean => {
    setError(null);
    
    switch (step) {
      case 1: // Reservation Details
        if (!formData.pickupDate) {
          setError('Please select a pickup date and time.');
          return false;
        }
        if (!formData.returnDate) {
          setError('Please select a return date and time.');
          return false;
        }
        const pickup = new Date(formData.pickupDate);
        const returnDateObj = new Date(formData.returnDate);
        if (returnDateObj <= pickup) {
          setError('Return date must be after the pickup date.');
          return false;
        }
        break;
        
      case 2: // Enhancements - no validation needed (can skip)
        break;
        
      case 3: // Driver Information
        let hasError = false;
        if (!formData.driverName.trim()) {
          setError('Please enter the driver\'s full name.');
          setTouchedFields(prev => ({ ...prev, driverName: true }));
          return false;
        }
        if (!formData.driverEmail.trim()) {
          setError('Please enter the driver\'s email address.');
          setTouchedFields(prev => ({ ...prev, driverEmail: true }));
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.driverEmail)) {
          setError('Please enter a valid email address.');
          setTouchedFields(prev => ({ ...prev, driverEmail: true }));
          return false;
        }
        if (!formData.driverPhone.trim()) {
          setError('Please enter the driver\'s phone number.');
          setTouchedFields(prev => ({ ...prev, driverPhone: true }));
          return false;
        }
        if (!formData.licenseNumber.trim()) {
          setError('Please enter the driver\'s license number.');
          setTouchedFields(prev => ({ ...prev, licenseNumber: true }));
          return false;
        }
        if (!formData.licenseFile) {
          setError('Please upload a photo of the driver\'s license.');
          setTouchedFields(prev => ({ ...prev, licenseFile: true }));
          return false;
        }
        break;
    }
    
    return true;
  };

  const steps = [
    'Reservation Details',
    'Enhancements',
    'Driver Information',
    'Payment',
    'Confirmation'
  ];

  interface TotalResult {
    basePrice: number;
    enhancementsPrice: number;
    total: number;
    days: number;
  }

  const calculateTotal = (): TotalResult => {
    if (!vehicle || !formData.pickupDate || !formData.returnDate) {
      return { basePrice: 0, enhancementsPrice: 0, total: 0, days: 0 };
    }
    
    const pickup = new Date(formData.pickupDate);
    const returnDateObj = new Date(formData.returnDate);
    const days = Math.max(1, Math.ceil((returnDateObj.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    
    const basePrice = vehicle.pricePerDay * days;
    const enhancementsPrice = formData.selectedEnhancements.reduce((total, enhName) => {
      const enh = ENHANCEMENTS.find(e => e.name === enhName);
      return total + (enh ? enh.price * days : 0);
    }, 0);
    
    return { basePrice, enhancementsPrice, total: basePrice + enhancementsPrice, days };
  };

  const { basePrice, enhancementsPrice, total, days } = calculateTotal();

  const handleEnhancementToggle = (name: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEnhancements: prev.selectedEnhancements.includes(name)
        ? prev.selectedEnhancements.filter(n => n !== name)
        : [...prev.selectedEnhancements, name]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
  };

  // Handle license file upload
  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, licenseFile: file }));
    setTouchedFields(prev => ({ ...prev, licenseFile: true }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLicensePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const triggerLicenseUpload = () => {
    if (licenseInputRef.current) {
      licenseInputRef.current.click();
    }
  };

  const removeLicense = () => {
    setFormData(prev => ({ ...prev, licenseFile: null }));
    setLicensePreview(null);
    if (licenseInputRef.current) {
      licenseInputRef.current.value = '';
    }
  };

  const handleSubmitBooking = async () => {
    if (!isLoggedIn) {
      setError('Please log in to complete your reservation.');
      return;
    }

    if (!vehicle) {
      setError('Vehicle not found. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookingData = {
        vehicle_id: parseInt(vehicle.id),
        pickup_date: formData.pickupDate,
        return_date: formData.returnDate,
        pickup_location: formData.pickupLocation,
        return_location: formData.returnLocation === 'Same as Pick-up' ? formData.pickupLocation : formData.returnLocation,
        driver_name: formData.driverName,
        driver_email: formData.driverEmail,
        driver_phone: formData.driverPhone,
        license_number: formData.licenseNumber,
        license_image: formData.licenseFile || undefined,
        enhancements: JSON.stringify(formData.selectedEnhancements),
        base_price: basePrice,
        enhancements_price: enhancementsPrice,
        total_price: total,
      };

      const result = await ApiService.createBooking(bookingData);
      setBookingSuccess(result);
      nextStep();
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state for vehicle
  if (isLoadingVehicle) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-12">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#d4af37] w-1/4 animate-pulse"></div>
            </div>
          </div>
          <div className="glass p-12 rounded-sm shadow-2xl space-y-8">
            <div className="h-10 w-64 bg-white/5 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-white/5 rounded animate-pulse"></div>
                  <div className="h-12 w-full bg-white/5 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-6 p-6 bg-white/[0.02] border border-white/5">
              <div className="w-24 h-16 bg-white/5 rounded animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-white/5 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-white/5 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login required check
  if (!isLoggedIn && step < 5) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass p-12 md:p-16 rounded-sm shadow-2xl text-center">
            <div className="w-20 h-20 gold-bg/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-10 h-10 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold serif mb-4">Member <span className="gold-text italic">Access</span></h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Please sign in to your Luxe Concierge account to proceed with your luxury vehicle reservation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/login', { state: { from: location } })}
                className="gold-bg text-black px-12 py-4 font-bold uppercase tracking-widest text-xs hover:brightness-110"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="border border-white/10 px-12 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white/5"
              >
                Become a Member
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No vehicle found
  if (!vehicle) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="glass p-12 rounded-sm shadow-2xl text-center">
            <h2 className="text-3xl font-bold serif mb-4">Vehicle <span className="gold-text italic">Not Found</span></h2>
            <p className="text-white/40 mb-8">
              The selected vehicle could not be loaded. Please try again.
            </p>
            <button 
              onClick={() => navigate('/fleet')}
              className="gold-bg text-black px-12 py-4 font-bold uppercase tracking-widest text-xs hover:brightness-110"
            >
              Browse Fleet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-4">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  step > i + 1 ? 'gold-bg text-black border-[#d4af37]' :
                  step === i + 1 ? 'border-[#d4af37] gold-text ring-4 ring-[#d4af37]/20' :
                  'border-white/10 text-white/20'
                }`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span className={`text-[8px] uppercase tracking-widest font-bold hidden sm:block ${
                  step === i + 1 ? 'gold-text' : 'text-white/20'
                }`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
          <div className="h-[2px] w-full bg-white/5 relative">
            <div 
              className="h-full gold-bg transition-all duration-500" 
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-sm text-red-400 text-sm animate-fadeIn">
            {error}
          </div>
        )}

        {/* Availability Error Message */}
        {availabilityError && (
          <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-sm text-orange-400 text-sm animate-fadeIn">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{availabilityError}</span>
            </div>
          </div>
        )}

        {/* Loading indicator for availability check */}
        {isCheckingAvailability && (
          <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-sm text-blue-400 text-sm animate-fadeIn">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Checking vehicle availability...</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="glass p-8 md:p-12 rounded-sm shadow-2xl">
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-3xl font-bold serif">Rental <span className="gold-text italic">Details</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Pick-up Location</label>
                  <select 
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-[#d4af37]"
                  >
                    <option className="bg-black">Dubai Marina Showroom</option>
                    <option className="bg-black">Dubai Int. Airport (DXB)</option>
                    <option className="bg-black">Downtown Dubai Concierge</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Return Location</label>
                  <select 
                    name="returnLocation"
                    value={formData.returnLocation}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-[#d4af37]"
                  >
                    <option className="bg-black">Same as Pick-up</option>
                    <option className="bg-black">Dubai Int. Airport (DXB)</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Pick-up Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleInputChange}
                    min={getMinDateTime()}
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-[#d4af37] inverted-calendar" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Return Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    min={getMinReturnDate()}
                    className="w-full bg-white/5 border border-white/10 p-4 text-sm focus:outline-none focus:border-[#d4af37] inverted-calendar" 
                  />
                </div>
              </div>
              <div className="p-6 bg-white/[0.02] border border-white/5 flex items-center space-x-6">
                <img src={vehicle.image || 'https://picsum.photos/400/300'} className="w-24 h-16 object-cover rounded-sm" />
                <div>
                  <h4 className="font-bold serif">{vehicle.make} {vehicle.model}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">${vehicle.pricePerDay} per day</p>
                  {days > 0 && (
                    <p className="text-[10px] uppercase tracking-widest gold-text mt-1">{days} day{days > 1 ? 's' : ''} selected</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-3xl font-bold serif">Luxury <span className="gold-text italic">Enhancements</span></h2>
              <p className="text-white/40 text-sm">Select any enhancements to elevate your experience (optional)</p>
              <div className="space-y-4">
                {ENHANCEMENTS.map((addon, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleEnhancementToggle(addon.name)}
                    className={`flex items-center justify-between p-6 border transition-all cursor-pointer group ${
                      formData.selectedEnhancements.includes(addon.name)
                        ? 'border-[#d4af37] bg-[#d4af37]/5'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex-grow pr-4">
                      <h4 className="font-bold text-sm tracking-widest uppercase mb-1">{addon.name}</h4>
                      <p className="text-xs text-white/40">{addon.desc}</p>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="text-sm font-bold gold-text mb-2">+${addon.price}/day</p>
                      <input 
                        type="checkbox" 
                        checked={formData.selectedEnhancements.includes(addon.name)}
                        onChange={() => {}}
                        className="w-5 h-5 accent-[#d4af37] pointer-events-none" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-3xl font-bold serif">Driver <span className="gold-text italic">Information</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Full Name *</label>
                  <input 
                    type="text" 
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, driverName: true }))}
                    placeholder="Enter full name as on license"
                    className={`w-full bg-white/5 border p-4 text-sm focus:outline-none ${
                      touchedFields.driverName && !formData.driverName.trim() 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:border-[#d4af37]'
                    }`} 
                  />
                  {touchedFields.driverName && !formData.driverName.trim() && (
                    <p className="text-xs text-red-400">Full name is required</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Email Address *</label>
                  <input 
                    type="email" 
                    name="driverEmail"
                    value={formData.driverEmail}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, driverEmail: true }))}
                    placeholder="email@example.com"
                    className={`w-full bg-white/5 border p-4 text-sm focus:outline-none ${
                      touchedFields.driverEmail && !formData.driverEmail.trim() 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:border-[#d4af37]'
                    }`} 
                  />
                  {touchedFields.driverEmail && !formData.driverEmail.trim() && (
                    <p className="text-xs text-red-400">Email address is required</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="driverPhone"
                    value={formData.driverPhone}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, driverPhone: true }))}
                    placeholder="+971 50 123 4567"
                    className={`w-full bg-white/5 border p-4 text-sm focus:outline-none ${
                      touchedFields.driverPhone && !formData.driverPhone.trim() 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:border-[#d4af37]'
                    }`} 
                  />
                  {touchedFields.driverPhone && !formData.driverPhone.trim() && (
                    <p className="text-xs text-red-400">Phone number is required</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">License Number *</label>
                  <input 
                    type="text" 
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, licenseNumber: true }))}
                    placeholder="Enter license number"
                    className={`w-full bg-white/5 border p-4 text-sm focus:outline-none ${
                      touchedFields.licenseNumber && !formData.licenseNumber.trim() 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/10 focus:border-[#d4af37]'
                    }`} 
                  />
                  {touchedFields.licenseNumber && !formData.licenseNumber.trim() && (
                    <p className="text-xs text-red-400">License number is required</p>
                  )}
                </div>
              </div>
              
              {/* License Upload */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Driver's License *</label>
                {licensePreview ? (
                  <div className="relative inline-block">
                    <img 
                      src={licensePreview} 
                      alt="License preview" 
                      className="max-w-xs max-h-48 object-contain rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={removeLicense}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="text-xs text-white/40 mt-2">
                      {formData.licenseFile?.name}
                    </p>
                    <button
                      type="button"
                      onClick={triggerLicenseUpload}
                      className="text-xs text-[#d4af37] hover:text-[#c4a027] mt-2 underline"
                    >
                      Upload different file
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={triggerLicenseUpload}
                    onKeyDown={(e) => e.key === 'Enter' && triggerLicenseUpload()}
                    className={`w-full border-2 border-dashed p-12 text-center rounded-sm transition-all cursor-pointer focus:outline-none ${
                      touchedFields.licenseFile 
                        ? 'border-red-500 hover:border-red-400' 
                        : 'border-white/10 hover:border-[#d4af37]/50'
                    }`}
                    aria-label="Upload driver's license"
                  >
                    <svg className="w-12 h-12 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Upload Front & Back of Driver's License</p>
                    <p className="text-[10px] text-white/20">JPG, PNG up to 5MB</p>
                  </button>
                )}
                {touchedFields.licenseFile && !formData.licenseFile && (
                  <p className="text-xs text-red-400">License image is required</p>
                )}
                <input
                  ref={licenseInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLicenseUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-3xl font-bold serif">Payment <span className="gold-text italic">Method</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="p-6 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-sm">
                    <div className="flex items-center space-x-4 mb-4">
                      <svg className="w-8 h-8 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <h4 className="font-bold text-sm tracking-widest uppercase">Manual Payment at Pickup</h4>
                        <p className="text-xs text-white/40">Pay with card or cash when you collect your vehicle</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-white/60">
                      <svg className="w-4 h-4 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>No prepayment required • Pay upon arrival</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border border-white/10 rounded-sm">
                      <input type="radio" name="payment" defaultChecked className="w-4 h-4 accent-[#d4af37]" />
                      <span className="text-sm">Credit/Debit Card at Pickup</span>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border border-white/10 rounded-sm">
                      <input type="radio" name="payment" className="w-4 h-4 accent-[#d4af37]" />
                      <span className="text-sm">Cash Payment at Pickup</span>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border border-white/10 rounded-sm">
                      <input type="radio" name="payment" className="w-4 h-4 accent-[#d4af37]" />
                      <span className="text-sm">Bank Transfer</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/[0.03] p-8 border border-white/5 space-y-6 rounded-sm">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold gold-text">Order Summary</h4>
                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/40 uppercase tracking-widest">{vehicle.make} {vehicle.model} ({days} Days)</span>
                      <span>${basePrice.toLocaleString()}</span>
                    </div>
                    {formData.selectedEnhancements.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/40 uppercase tracking-widest">Enhancements</span>
                        <span>${enhancementsPrice.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                      <span className="text-sm font-bold uppercase tracking-widest">Total Amount</span>
                      <span className="text-2xl font-bold gold-text">${total.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 text-[10px] text-white/30 text-right">
                      Payment due at pickup
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && bookingSuccess && (
            <div className="text-center py-12 space-y-8 animate-fadeIn">
              <div className="w-24 h-24 gold-bg/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <svg className="w-12 h-12 gold-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold serif">Your Suite is <span className="gold-text italic">Reserved</span></h2>
              <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed uppercase tracking-widest">
                Booking reference <span className="gold-text font-bold">{bookingSuccess.booking_reference}</span>.<br />
                A confirmation email has been sent to your inbox.
              </p>
              <div className="p-6 bg-white/[0.02] border border-white/5 inline-block rounded-sm">
                <div className="grid grid-cols-2 gap-8 text-left text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Pickup</p>
                    <p className="font-bold">{formData.pickupLocation}</p>
                    <p className="text-xs text-white/40">{new Date(formData.pickupDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Return</p>
                    <p className="font-bold">{formData.returnLocation === 'Same as Pick-up' ? formData.pickupLocation : formData.returnLocation}</p>
                    <p className="text-xs text-white/40">{new Date(formData.returnDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button 
                  onClick={() => navigate('/account')}
                  className="gold-bg text-black px-10 py-4 font-bold uppercase tracking-widest text-xs hover:brightness-110"
                >
                  View My Bookings
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="border border-white/10 px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-white/5"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 5 && (
            <div className="flex justify-between pt-12 border-t border-white/10 mt-12">
              <button 
                onClick={prevStep}
                disabled={step === 1}
                className={`text-[10px] uppercase tracking-widest font-bold flex items-center space-x-2 transition-all ${
                  step === 1 ? 'opacity-0 pointer-events-none' : 'text-white/50 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <button 
                onClick={step === 4 ? handleSubmitBooking : nextStep}
                disabled={isLoading || isCheckingAvailability}
                className="gold-bg text-black px-12 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all flex items-center space-x-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : isCheckingAvailability ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Checking Availability...</span>
                  </>
                ) : (
                  <>
                    <span>{step === 4 ? 'Confirm Reservation' : 'Continue'}</span>
                    {step < 4 && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
