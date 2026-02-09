import React, { useState, useRef, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { type Vehicle, VehicleCategory } from '../../types';
import { SkeletonCard } from '../../components/Skeleton';

const AdminFleet: React.FC = () => {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialFormState: Partial<Vehicle> = {
    make: '',
    model: '',
    year: 2024,
    category: VehicleCategory.SPORT,
    pricePerDay: 0,
    image: '',
    gallery: [],
    transmission: 'Automatic',
    seats: 2,
    engine: '',
    horsepower: 0,
    zeroToSixty: '',
    topSpeed: '',
    availability: 'Available'
  };

  const [formData, setFormData] = useState<Partial<Vehicle>>(initialFormState);

  // [READ] - Fetch all vehicles
  const fetchFleet = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getVehicles();
      setFleet(data);
    } catch (err) {
      console.error("System Error: Failed to synchronize with fleet database.", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'pricePerDay', 'horsepower', 'seats'].includes(name)
        ? parseInt(value) || 0 
        : value
    }));
  };

  // Handle image file upload (multiple images)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    let invalidFiles = 0;

    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        invalidFiles++;
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles++;
        return;
      }

      newFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (invalidFiles > 0) {
      alert(`${invalidFiles} file(s) were skipped. Only images under 5MB are allowed.`);
    }

    // Reset file input to allow re-uploading the same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove a specific image by index
  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Move image to main position (first position)
  const setAsMain = (index: number) => {
    if (index === 0) return; // Already main
    const newPreviews = [...imagePreviews];
    const [movedImage] = newPreviews.splice(index, 1);
    newPreviews.unshift(movedImage);
    setImagePreviews(newPreviews);
  };

  // Drag and drop reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newPreviews = [...imagePreviews];
    const [movedImage] = newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(index, 0, movedImage);
    setImagePreviews(newPreviews);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // [DELETE] - Remove vehicle from fleet
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this vehicle from the fleet?")) return;
    
    try {
      await ApiService.deleteVehicle(id);
      setFleet(prev => prev.filter(v => v.id !== id));
      if (editingVehicleId === id) setIsModalOpen(false);
    } catch (err: any) {
      alert("Failed to delete vehicle: " + err.message);
    }
  };

  // [CREATE & UPDATE] - Sync form data with backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let submitData = { ...formData };
      
      // Use imagePreviews as the source of truth for images (handles both URLs and Base64)
      if (imagePreviews.length > 0) {
        submitData.image = imagePreviews[0];
        submitData.gallery = imagePreviews.slice(1);
      } else {
        submitData.image = '';
        submitData.gallery = [];
      }

      if (editingVehicleId) {
        // [UPDATE]
        await ApiService.updateVehicle(editingVehicleId, submitData);
      } else {
        // [CREATE]
        await ApiService.createVehicle(submitData);
      }
      
      await fetchFleet();
      setIsModalOpen(false);
      setFormData(initialFormState);
      setEditingVehicleId(null);
      setImagePreviews([]);
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to save vehicle';
      try {
        const parsed = JSON.parse(errorMessage);
        if (typeof parsed === 'object') {
          const errors = Object.entries(parsed)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          errorMessage = errors || errorMessage;
        }
      } catch {
        // Not JSON, use as-is
      }
      alert(`Error saving vehicle:\n\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingVehicleId(null);
    setFormData(initialFormState);
    setImagePreviews([]);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setFormData({ ...vehicle });
    
    // Load existing images into previews
    const existingImages = [vehicle.image, ...(vehicle.gallery || [])].filter(Boolean) as string[];
    setImagePreviews(existingImages);
    
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Fleet Management
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage your luxury vehicle collection</p>
          </div>
          <button 
            onClick={openAddModal}
            className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Vehicle</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Fleet</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{fleet.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Available</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {fleet.filter(v => v.availability === 'Available').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-xl border border-white/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">In Service</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {fleet.filter(v => v.availability !== 'Available').length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Grid View of Assets */}
        {isLoading ? (
          <div className="py-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : fleet.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200">
            <svg className="w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">No vehicles in fleet</p>
              <p className="text-sm text-slate-500 mt-1">Add your first vehicle to get started</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fleet.map(v => (
              <div key={v.id} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 group">
                <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                  <img 
                    src={v.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    alt={`${v.make} ${v.model}`} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm ${
                      v.availability === 'Available' ? 'bg-emerald-500/90 text-white' : 
                      v.availability === 'Maintenance' ? 'bg-amber-500/90 text-white' : 'bg-red-500/90 text-white'
                    }`}>
                      {v.availability}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white/90 text-slate-700 backdrop-blur-sm">
                      {v.category}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-grow space-y-4">
                  <div>
                    <h4 className="font-bold text-lg text-slate-800">{v.make} {v.model}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{v.year} • {v.transmission}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Daily Rate</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">${v.pricePerDay}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Power</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{v.horsepower} HP</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Seats</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{v.seats}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => openEditModal(v)}
                      className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 py-2.5 rounded-xl text-xs font-semibold transition-all border border-blue-200/50"
                    >
                      Edit Details
                    </button>
                    <button 
                      onClick={() => handleDelete(v.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete vehicle"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CRUD Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-blue-50">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {editingVehicleId ? 'Edit Vehicle' : 'Add New Vehicle'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {editingVehicleId ? 'Update vehicle information' : 'Add a new vehicle to your fleet'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                {/* Image Upload Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Vehicle Images</label>
                  
                  {/* Image Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                      {imagePreviews.map((preview, index) => (
                        <div 
                          key={index} 
                          className={`relative group ${draggedIndex === index ? 'opacity-50' : ''}`}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                        >
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg border-2 border-slate-200 cursor-move"
                          />
                          {/* Drag handle */}
                          <div className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/60 text-white p-1.5 rounded-lg cursor-grab active:cursor-grabbing">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                              </svg>
                            </div>
                          </div>
                          {/* Main image indicator and actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            {index === 0 ? (
                              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                ★ Main
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAsMain(index)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-700 transition-all"
                                title="Set as main image"
                              >
                                ★ Set as Main
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-all"
                              title="Remove image"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                                Main
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Upload Area */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                  >
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600">
                      {imagePreviews.length > 0 ? 'Add more images' : 'Click to upload vehicle images'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, WEBP up to 5MB • Multiple images allowed
                    </p>
                    {imagePreviews.length > 0 && (
                      <p className="text-xs text-blue-600 font-semibold mt-2">
                        {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-slate-500 italic">
                    💡 Drag images to reorder • First image is the main vehicle image
                  </p>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Make *</label>
                      <input 
                        required 
                        name="make" 
                        value={formData.make} 
                        onChange={handleInputChange} 
                        type="text" 
                        placeholder="e.g. Ferrari"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Model *</label>
                      <input 
                        required 
                        name="model" 
                        value={formData.model} 
                        onChange={handleInputChange} 
                        type="text" 
                        placeholder="e.g. 488 GTB"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Year *</label>
                      <input 
                        required 
                        name="year" 
                        value={formData.year} 
                        onChange={handleInputChange} 
                        type="number" 
                        min="1900" 
                        max="2100" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Category *</label>
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleInputChange} 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                      >
                        {Object.values(VehicleCategory).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Daily Rate ($) *</label>
                      <input 
                        required 
                        name="pricePerDay" 
                        value={formData.pricePerDay} 
                        onChange={handleInputChange} 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        placeholder="0.00"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Transmission *</label>
                      <select 
                        name="transmission" 
                        value={formData.transmission} 
                        onChange={handleInputChange} 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Seats *</label>
                      <input 
                        required 
                        name="seats" 
                        value={formData.seats} 
                        onChange={handleInputChange} 
                        type="number" 
                        min="1" 
                        max="10" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Engine</label>
                      <input 
                        name="engine" 
                        value={formData.engine} 
                        onChange={handleInputChange} 
                        type="text" 
                        placeholder="e.g. 5.2L V10" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    Performance
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Horsepower</label>
                      <input 
                        name="horsepower" 
                        value={formData.horsepower} 
                        onChange={handleInputChange} 
                        type="number" 
                        placeholder="0"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">0-60 mph (s)</label>
                      <input 
                        name="zeroToSixty" 
                        value={formData.zeroToSixty} 
                        onChange={handleInputChange} 
                        type="text" 
                        placeholder="e.g. 3.2" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Top Speed</label>
                      <input 
                        name="topSpeed" 
                        value={formData.topSpeed} 
                        onChange={handleInputChange} 
                        type="text" 
                        placeholder="e.g. 205 mph"
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                    Status
                  </h4>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Availability *</label>
                    <select 
                      name="availability" 
                      value={formData.availability} 
                      onChange={handleInputChange} 
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                    >
                      <option value="Available">Available</option>
                      <option value="Rented">Rented</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || imagePreviews.length === 0} 
                    className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingVehicleId ? 'Update Vehicle' : 'Add Vehicle'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFleet;
