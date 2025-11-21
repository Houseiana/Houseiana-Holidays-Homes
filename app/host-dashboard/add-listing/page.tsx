'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  ArrowLeft,
  Upload,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  Plus,
  Minus,
  X,
  Camera
} from 'lucide-react';

interface PropertyFormData {
  // Basic Information
  title: string;
  description: string;
  propertyType: string;

  // Location
  address: {
    building: string;
    streetNumber: string;
    street: string;
    zone: string;
    district: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };

  // Property Details
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;

  // Pricing
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;

  // Amenities
  amenities: string[];

  // Photos
  photos: File[];

  // House Rules
  checkIn: string;
  checkOut: string;
  allowPets: boolean;
  allowSmoking: boolean;
  allowParties: boolean;
}

const STEPS = [
  { id: 1, title: 'Property Type', description: 'Tell us about your place' },
  { id: 2, title: 'Location', description: 'Where is your property located?' },
  { id: 3, title: 'Property Details', description: 'Basic info about your space' },
  { id: 4, title: 'Amenities', description: 'What does your place offer?' },
  { id: 5, title: 'Photos', description: 'Show off your space' },
  { id: 6, title: 'Pricing', description: 'Set your nightly rate' },
  { id: 7, title: 'House Rules', description: 'Set expectations for guests' },
  { id: 8, title: 'Review', description: 'Review and publish' }
];

export default function AddListingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    propertyType: '',
    address: {
      building: '',
      streetNumber: '',
      street: '',
      zone: '',
      district: '',
      city: '',
      state: '',
      country: 'Qatar',
      zipCode: ''
    },
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    basePrice: 100,
    cleaningFee: 25,
    serviceFee: 15,
    amenities: [],
    photos: [],
    checkIn: '15:00',
    checkOut: '11:00',
    allowPets: false,
    allowSmoking: false,
    allowParties: false
  });

  const propertyTypes = [
    { id: 'house', name: 'House', icon: '🏠', description: 'Entire place' },
    { id: 'apartment', name: 'Apartment', icon: '🏢', description: 'Entire place' },
    { id: 'villa', name: 'Villa', icon: '🏡', description: 'Luxury property' },
    { id: 'condo', name: 'Condo', icon: '🏘️', description: 'Condominium' },
    { id: 'townhouse', name: 'Townhouse', icon: '🏘️', description: 'Multi-story home' },
    { id: 'studio', name: 'Studio', icon: '🏠', description: 'Open floor plan' },
    { id: 'loft', name: 'Loft', icon: '🏢', description: 'Industrial style' },
    { id: 'cabin', name: 'Cabin', icon: '🏕️', description: 'Rustic retreat' },
    { id: 'cottage', name: 'Cottage', icon: '🏡', description: 'Cozy getaway' },
    { id: 'hotel_room', name: 'Hotel Room', icon: '🏨', description: 'Private room' }
  ];

  const qatarZonesDistricts: Record<string, { city: string; districts: string[] }> = {
    '1': { city: 'Doha', districts: ['Al Jasrah'] },
    '2': { city: 'Doha', districts: ['Al Bidda'] },
    '3': { city: 'Doha', districts: ['Fereej Mohamed Bin Jasim', 'Mushayrib'] },
    '4': { city: 'Doha', districts: ['Mushayrib'] },
    '5': { city: 'Doha', districts: ['Al Najada', 'Barahat Al Jufairi', 'Fereej Al Asmakh'] },
    '6': { city: 'Doha', districts: ['Old Al Ghanim'] },
    '7': { city: 'Doha', districts: ['Al Souq'] },
    '10': { city: 'Doha', districts: ['Wadi Al Sail'] },
    '11': { city: 'Doha', districts: ['Rumeilah'] },
    '12': { city: 'Doha', districts: ['Al Bidda'] },
    '13': { city: 'Doha', districts: ['Mushayrib'] },
    '14': { city: 'Doha', districts: ['Fereej Abdel Aziz'] },
    '15': { city: 'Doha', districts: ['Ad Dawhah al Jadidah'] },
    '16': { city: 'Doha', districts: ['Old Al Ghanim'] },
    '17': { city: 'Doha', districts: ['Al Rufaa', 'Old Al Hitmi'] },
    '18': { city: 'Doha', districts: ['As Salatah', 'Al Mirqab'] },
    '19': { city: 'Doha', districts: ['Doha Port'] },
    '20': { city: 'Doha', districts: ['Wadi Al Sail'] },
    '21': { city: 'Doha', districts: ['Rumeilah'] },
    '22': { city: 'Doha', districts: ['Fereej Bin Mahmoud'] },
    '23': { city: 'Doha', districts: ['Fereej Bin Mahmoud'] },
    '24': { city: 'Doha', districts: ['Rawdat Al Khail'] },
    '25': { city: 'Doha', districts: ['Fereej Bin Durham', 'Al Mansoura'] },
    '26': { city: 'Doha', districts: ['Najma'] },
    '27': { city: 'Doha', districts: ['Umm Ghuwailina'] },
    '28': { city: 'Doha', districts: ['Al Khulaifat', 'Ras Abu Aboud'] },
    '30': { city: 'Doha', districts: ['Duhail'] },
    '31': { city: 'Doha', districts: ['Umm Lekhba'] },
    '32': { city: 'Doha', districts: ['Madinat Khalifa North', 'Dahl Al Hamam'] },
    '33': { city: 'Doha', districts: ['Al Markhiya'] },
    '34': { city: 'Doha', districts: ['Madinat Khalifa South'] },
    '35': { city: 'Doha', districts: ['Fereej Kulaib'] },
    '36': { city: 'Doha', districts: ['Al Messila'] },
    '37': { city: 'Doha', districts: ['Fereej Bin Omran', 'New Al Hitmi', 'Hamad Medical City'] },
    '38': { city: 'Doha', districts: ['Al Sadd'] },
    '39': { city: 'Doha', districts: ['Al Sadd', 'New Al Mirqab', 'Fereej Al Nasr'] },
    '40': { city: 'Doha', districts: ['New Salatah'] },
    '41': { city: 'Doha', districts: ['Nuaija'] },
    '42': { city: 'Doha', districts: ['Al Hilal'] },
    '43': { city: 'Doha', districts: ['Nuaija'] },
    '44': { city: 'Doha', districts: ['Nuaija'] },
    '45': { city: 'Doha', districts: ['Old Airport'] },
    '46': { city: 'Doha', districts: ['Al Thumama'] },
    '47': { city: 'Doha', districts: ['Al Thumama'] },
    '48': { city: 'Doha', districts: ['Doha International Airport'] },
    '49': { city: 'Doha', districts: ['Doha International Airport'] },
    '50': { city: 'Doha', districts: ['Zone 50'] },
    '57': { city: 'Doha', districts: ['Industrial Area'] },
    '58': { city: 'Doha', districts: ['Zone 58'] },
    '61': { city: 'Doha', districts: ['Al Dafna', 'Al Qassar'] },
    '63': { city: 'Doha', districts: ['Onaiza'] },
    '64': { city: 'Doha', districts: ['Lejbailat'] },
    '65': { city: 'Doha', districts: ['Onaiza'] },
    '66': { city: 'Doha', districts: ['Onaiza', 'Leqtaifiya', 'Al Qassar'] },
    '67': { city: 'Doha', districts: ['Hazm Al Markhiya'] },
    '68': { city: 'Doha', districts: ['Jelaiah', 'Al Tarfa', 'Jeryan Nejaima'] },
    '51': { city: 'Al Rayyan', districts: ['Al Gharrafa', 'Gharrafat Al Rayyan', 'Izghawa', 'Bani Hajer', 'Al Seej', 'Rawdat Egdaim', 'Al Themaid'] },
    '52': { city: 'Al Rayyan', districts: ['Al Luqta', 'Lebday', 'Old Al Rayyan', 'Al Shagub', 'Fereej Al Zaeem'] },
    '53': { city: 'Al Rayyan', districts: ['New Al Rayyan', 'Al Wajbah', 'Muaither'] },
    '54': { city: 'Al Rayyan', districts: ['Fereej Al Amir', 'Luaib', 'Muraikh', 'Baaya', 'Mehairja', 'Fereej Al Soudan'] },
    '55': { city: 'Al Rayyan', districts: ['Fereej Al Soudan', 'Al Waab', 'Al Aziziya', 'New Fereej Al Ghanim', 'Fereej Al Murra', 'Fereej Al Manaseer', 'Bu Sidra', 'Muaither', 'Al Sailiya', 'Al Mearad'] },
    '56': { city: 'Al Rayyan', districts: ['Fereej Al Asiri', 'New Fereej Al Khulaifat', 'Bu Samra', 'Al Mamoura', 'Abu Hamour', 'Mesaimeer', 'Ain Khaled', 'Umm Al Seneem'] },
    '81': { city: 'Al Rayyan', districts: ['Mebaireek'] },
    '83': { city: 'Al Rayyan', districts: ['Al Karaana'] },
    '96': { city: 'Al Rayyan', districts: ['Abu Samra'] },
    '97': { city: 'Al Rayyan', districts: ['Sawda Natheel'] },
    '69': { city: 'Al Daayen', districts: ['Jabal Thuaileb', 'Al Kharayej', 'Lusail', 'Al Egla', 'Wadi Al Banat'] },
    '70': { city: 'Al Daayen', districts: ['Leabaib', 'Al Ebb', 'Jeryan Jenaihat', 'Al Kheesa', 'Rawdat Al Hamama', 'Wadi Al Wasaah', 'Al Sakhama', 'Al Masrouhiya', 'Wadi Lusail', 'Lusail', 'Umm Qarn', 'Al Daayen'] },
    '71': { city: 'Umm Salal', districts: ['Bu Fasseela', 'Izghawa', 'Al Kharaitiyat', 'Umm Salal Ali', 'Umm Salal Mohammed', 'Saina Al-Humaidi', 'Umm Al Amad', 'Umm Ebairiya'] },
    '74': { city: 'Al Khor', districts: ['Simaisma', 'Al Jeryan', 'Al Khor City'] },
    '75': { city: 'Al Khor', districts: ['Al Thakhira', 'Ras Laffan', 'Umm Birka'] },
    '76': { city: 'Al Khor', districts: ['Al Ghuwariyah'] },
    '77': { city: 'Al Shamal', districts: ['Ain Sinan', 'Madinat Al Kaaban', 'Fuwayrit'] },
    '78': { city: 'Al Shamal', districts: ['Abu Dhalouf', 'Zubarah'] },
    '79': { city: 'Al Shamal', districts: ['Madinat ash Shamal', 'Ar Ru\'ays'] },
    '72': { city: 'Al Shahaniya', districts: ['Al Utouriya'] },
    '73': { city: 'Al Shahaniya', districts: ['Al Jemailiya'] },
    '80': { city: 'Al Shahaniya', districts: ['Al-Shahaniya City'] },
    '82': { city: 'Al Shahaniya', districts: ['Rawdat Rashed'] },
    '84': { city: 'Al Shahaniya', districts: ['Umm Bab'] },
    '85': { city: 'Al Shahaniya', districts: ['Al Nasraniya'] },
    '86': { city: 'Al Shahaniya', districts: ['Dukhan'] },
    '90': { city: 'Al Wakrah', districts: ['Al Wakrah'] },
    '91': { city: 'Al Wakrah', districts: ['Al Thumama', 'Al Wukair', 'Al Mashaf'] },
    '92': { city: 'Al Wakrah', districts: ['Mesaieed'] },
    '93': { city: 'Al Wakrah', districts: ['Mesaieed Industrial Area'] },
    '94': { city: 'Al Wakrah', districts: ['Shagra'] },
    '95': { city: 'Al Wakrah', districts: ['Al Kharrara'] },
    '98': { city: 'Al Wakrah', districts: ['Khor Al Adaid'] }
  };

  const amenities = [
    { id: 'wifi', name: 'WiFi', icon: '📶' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
    { id: 'washer', name: 'Washer', icon: '🧺' },
    { id: 'dryer', name: 'Dryer', icon: '🌪️' },
    { id: 'air_conditioning', name: 'Air conditioning', icon: '❄️' },
    { id: 'heating', name: 'Heating', icon: '🔥' },
    { id: 'workspace', name: 'Workspace', icon: '💻' },
    { id: 'tv', name: 'TV', icon: '📺' },
    { id: 'parking', name: 'Free parking', icon: '🅿️' },
    { id: 'pool', name: 'Pool', icon: '🏊' },
    { id: 'gym', name: 'Gym', icon: '🏋️' },
    { id: 'hot_tub', name: 'Hot tub', icon: '🛁' },
    { id: 'security', name: 'Security', icon: '🚪' },
    { id: 'bbq', name: 'BBQ grill', icon: '🔥' },
    { id: 'jacuzzi', name: 'Jacuzzi', icon: '🛀' },
    { id: 'private_garden', name: 'Private Garden', icon: '🌿' },
    { id: 'rooftop', name: 'RoofTop', icon: '🏢' },
    { id: 'swing', name: 'Swing', icon: '🪢' },
    { id: 'coffee_maker', name: 'Coffee Maker', icon: '☕' },
    { id: 'microwave', name: 'Microwave', icon: '🔳' }
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent as keyof PropertyFormData] as any), [field]: value }
    }));
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos].slice(0, 20) // Max 20 photos
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // After successful login, try to submit the property again
    // We'll need to wait a moment for the auth state to update
    setTimeout(() => {
      handleSubmit();
    }, 1000);
  };

  const handleSubmit = async () => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');

    if (!token || !userData) {
      setShowLoginModal(true);
      return;
    }

    const parsedUser = JSON.parse(userData);
    console.log('🏠 Submitting property listing...');

    try {
      // Validate required fields
      if (!formData.title || !formData.description) {
        alert('Please provide a title and description for your property');
        setCurrentStep(3);
        return;
      }

      if (!formData.propertyType) {
        alert('Please select a property type');
        setCurrentStep(1);
        return;
      }

      if (!formData.address.city || !formData.address.country) {
        alert('Please provide complete location information');
        setCurrentStep(2);
        return;
      }

      // Transform form data to match new Prisma schema
      const propertyData = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType.toUpperCase(), // HOUSE, APARTMENT, etc.
        roomType: 'ENTIRE_PLACE', // Default to entire place

        // Location
        country: formData.address.country,
        city: formData.address.city,
        state: formData.address.state || formData.address.district,
        address: `${formData.address.building ? formData.address.building + ', ' : ''}${formData.address.streetNumber} ${formData.address.street}, Zone ${formData.address.zone}, ${formData.address.district}`.trim(),
        zipCode: formData.address.zipCode || null,
        latitude: null, // Can add geocoding later
        longitude: null,

        // Capacity
        guests: formData.maxGuests,
        bedrooms: formData.bedrooms,
        beds: formData.bedrooms, // Assume 1 bed per bedroom
        bathrooms: formData.bathrooms,

        // Pricing
        pricePerNight: formData.basePrice,
        cleaningFee: formData.cleaningFee || 0,
        serviceFee: formData.serviceFee || 0,
        weeklyDiscount: 0,
        monthlyDiscount: 0,

        // Amenities (array of strings)
        amenities: formData.amenities,

        // Photos will be handled separately
        photos: [],
        coverPhoto: null,

        // House Rules
        checkInTime: formData.checkIn || '15:00',
        checkOutTime: formData.checkOut || '11:00',
        minNights: 1,
        maxNights: null,
        instantBook: false,
        allowPets: formData.allowPets,
        allowSmoking: formData.allowSmoking,
        allowEvents: formData.allowParties,

        // Status
        status: 'DRAFT' // Save as draft initially
      };

      console.log('📤 Sending property data:', propertyData);

      // Get auth token for request
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(propertyData),
      });

      const result = await response.json();
      console.log('📥 API Response:', result);

      if (response.ok && result.success) {
        alert(`✅ Property "${formData.title}" created successfully!\n\nYou can now add photos and publish it from your dashboard.`);
        router.push('/host-dashboard');
      } else {
        throw new Error(result.error || 'Failed to add property');
      }
    } catch (error: any) {
      console.error('❌ Error submitting property:', error);
      alert(`Failed to add property:\n${error.message}\n\nPlease check the console for details and try again.`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {propertyTypes.map((type) => {
              const isSelected = formData.propertyType === type.id;

              return (
                <button
                  key={type.id}
                  onClick={() => updateFormData('propertyType', type.id)}
                  className={`p-5 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-500 ring-opacity-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <span className="text-5xl mb-3 block">{type.icon}</span>
                  <h3 className="font-bold text-gray-900 mb-1 text-base">{type.name}</h3>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </button>
              );
            })}
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            {/* Building and Street Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Building Name/Number
                </label>
                <input
                  type="text"
                  value={formData.address.building}
                  onChange={(e) => updateNestedFormData('address', 'building', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="e.g., Al Fardan Tower, Building 12"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Street Number</label>
                <input
                  type="text"
                  value={formData.address.streetNumber}
                  onChange={(e) => updateNestedFormData('address', 'streetNumber', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="e.g., 123"
                />
              </div>
            </div>

            {/* Street Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Street Name</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => updateNestedFormData('address', 'street', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="e.g., Al Sadd Street, Corniche Road"
              />
            </div>

            {/* Zone and District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zone</label>
                <select
                  value={formData.address.zone}
                  onChange={(e) => {
                    const selectedZone = e.target.value;
                    updateNestedFormData('address', 'zone', selectedZone);
                    updateNestedFormData('address', 'district', ''); // Reset district when zone changes
                    // Auto-populate city based on zone
                    if (selectedZone && qatarZonesDistricts[selectedZone]) {
                      updateNestedFormData('address', 'city', qatarZonesDistricts[selectedZone].city);
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="">Select a zone</option>
                  {Object.keys(qatarZonesDistricts).sort((a, b) => Number(a) - Number(b)).map((zone) => (
                    <option key={zone} value={zone}>Zone {zone} - {qatarZonesDistricts[zone].city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">District</label>
                <select
                  value={formData.address.district}
                  onChange={(e) => updateNestedFormData('address', 'district', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  disabled={!formData.address.zone}
                >
                  <option value="">Select a district</option>
                  {formData.address.zone && qatarZonesDistricts[formData.address.zone]?.districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
                {!formData.address.zone && (
                  <p className="text-xs text-gray-500 mt-1">Please select a zone first</p>
                )}
              </div>
            </div>

            {/* City (Auto-populated based on zone) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <select
                value={formData.address.city}
                onChange={(e) => updateNestedFormData('address', 'city', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all ${
                  formData.address.zone &&
                  formData.address.city &&
                  qatarZonesDistricts[formData.address.zone]?.city !== formData.address.city
                    ? 'border-red-500 focus:border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-indigo-500'
                }`}
              >
                <option value="">Select a city</option>
                <option value="Doha">Doha</option>
                <option value="Al Rayyan">Al Rayyan</option>
                <option value="Al Wakrah">Al Wakrah</option>
                <option value="Al Khor">Al Khor</option>
                <option value="Al Daayen">Al Daayen</option>
                <option value="Umm Salal">Umm Salal</option>
                <option value="Al Shahaniya">Al Shahaniya</option>
                <option value="Al Shamal">Al Shamal</option>
              </select>
              {formData.address.zone &&
               formData.address.city &&
               qatarZonesDistricts[formData.address.zone]?.city !== formData.address.city ? (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Error: Zone {formData.address.zone} belongs to {qatarZonesDistricts[formData.address.zone]?.city}, not {formData.address.city}. Please select the correct city.</span>
                </p>
              ) : formData.address.zone && formData.address.city ? (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span>✓</span>
                  <span>City matches Zone {formData.address.zone}</span>
                </p>
              ) : formData.address.zone ? (
                <p className="text-xs text-indigo-600 mt-1">Auto-selected based on Zone {formData.address.zone}</p>
              ) : null}
            </div>

            {/* Country (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address.country}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg bg-indigo-50 text-indigo-900 font-semibold cursor-not-allowed"
                  placeholder="Country"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-2xl">🇶🇦</span>
                </div>
              </div>
              <p className="text-xs text-indigo-600 mt-1">Properties are only available in Qatar</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Give your place a catchy title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Describe your space, what makes it special, and what guests can expect"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Bedrooms
                </label>
                <div className="flex items-center justify-between p-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <span className="font-bold text-lg text-gray-900 min-w-[30px]">{formData.bedrooms}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFormData('bedrooms', Math.max(1, formData.bedrooms - 1))}
                      className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-white flex items-center justify-center hover:bg-indigo-50 transition-all flex-shrink-0"
                    >
                      <Minus className="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => updateFormData('bedrooms', formData.bedrooms + 1)}
                      className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-indigo-600 flex items-center justify-center hover:bg-indigo-700 transition-all flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Bathrooms
                </label>
                <div className="flex items-center justify-between p-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <span className="font-bold text-lg text-gray-900 min-w-[30px]">{formData.bathrooms}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFormData('bathrooms', Math.max(1, formData.bathrooms - 1))}
                      className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-white flex items-center justify-center hover:bg-indigo-50 transition-all flex-shrink-0"
                    >
                      <Minus className="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => updateFormData('bathrooms', formData.bathrooms + 1)}
                      className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-indigo-600 flex items-center justify-center hover:bg-indigo-700 transition-all flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Max Guests
                </label>
                <div className="flex items-center justify-between p-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <span className="font-bold text-lg text-gray-900 min-w-[30px]">{formData.maxGuests}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateFormData('maxGuests', Math.max(1, formData.maxGuests - 1))}
                      className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-white flex items-center justify-center hover:bg-indigo-50 transition-all flex-shrink-0"
                    >
                      <Minus className="w-4 h-4 text-indigo-600" />
                    </button>
                    <button
                      onClick={() => updateFormData('maxGuests', formData.maxGuests + 1)}
                      className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-indigo-600 flex items-center justify-center hover:bg-indigo-700 transition-all flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {amenities.map((amenity) => {
              const isSelected = formData.amenities.includes(amenity.id);

              return (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`p-5 border-2 rounded-xl text-center transition-all hover:scale-105 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-500 ring-opacity-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <span className="text-4xl mx-auto mb-2 block">{amenity.icon}</span>
                  <span className="text-sm font-semibold text-gray-900 leading-tight">{amenity.name}</span>
                </button>
              );
            })}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-all bg-indigo-50/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e.target.files)}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Camera className="w-16 h-16 text-indigo-600 mb-4" />
                <span className="text-lg font-bold text-gray-900 mb-2">
                  Click to upload photos
                </span>
                <span className="text-sm text-gray-600">
                  Or drag and drop (Max 20 photos)
                </span>
              </label>
            </div>

            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-40 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Base price per night
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-bold">$</span>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => updateFormData('basePrice', parseInt(e.target.value) || 0)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xl font-bold transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cleaning fee</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    value={formData.cleaningFee}
                    onChange={(e) => updateFormData('cleaningFee', parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service fee</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    value={formData.serviceFee}
                    onChange={(e) => updateFormData('serviceFee', parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total per night:</span>
                <span className="text-3xl font-bold text-indigo-600">${formData.basePrice + formData.cleaningFee + formData.serviceFee}</span>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in time</label>
                <input
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => updateFormData('checkIn', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out time</label>
                <input
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => updateFormData('checkOut', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 border-2 border-gray-300 rounded-xl hover:border-indigo-300 transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl">🐾</div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Allow pets</h3>
                    <p className="text-sm text-gray-500">Guests can bring pets</p>
                  </div>
                </div>
                <button
                  onClick={() => updateFormData('allowPets', !formData.allowPets)}
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                    formData.allowPets ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block w-6 h-6 transform bg-white rounded-full shadow-lg transition-transform ${
                      formData.allowPets ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-5 border-2 border-gray-300 rounded-xl hover:border-indigo-300 transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl">🚭</div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Allow smoking</h3>
                    <p className="text-sm text-gray-500">Guests can smoke inside</p>
                  </div>
                </div>
                <button
                  onClick={() => updateFormData('allowSmoking', !formData.allowSmoking)}
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                    formData.allowSmoking ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block w-6 h-6 transform bg-white rounded-full shadow-lg transition-transform ${
                      formData.allowSmoking ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-5 border-2 border-gray-300 rounded-xl hover:border-indigo-300 transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Allow parties/events</h3>
                    <p className="text-sm text-gray-500">Guests can host events</p>
                  </div>
                </div>
                <button
                  onClick={() => updateFormData('allowParties', !formData.allowParties)}
                  className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors ${
                    formData.allowParties ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block w-6 h-6 transform bg-white rounded-full shadow-lg transition-transform ${
                      formData.allowParties ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="bg-gray-100 h-64 lg:h-80 flex items-center justify-center">
                {formData.photos.length > 0 ? (
                  <img
                    src={URL.createObjectURL(formData.photos[0])}
                    alt="Property preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center p-4">
                    <Camera className="w-16 h-16 mx-auto mb-3" />
                    <span className="text-base">No photos uploaded</span>
                  </div>
                )}
              </div>

              <div className="p-6 lg:p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {formData.title || 'Untitled Property'}
                </h3>
                <p className="text-base text-gray-600 mb-5 line-clamp-3">
                  {formData.description || 'No description provided'}
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-semibold">Type:</span>
                    <span className="capitalize text-gray-900 font-bold">{formData.propertyType || 'Not selected'}</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span className="text-gray-600 font-semibold">Location:</span>
                    </div>
                    <div className="text-gray-900 text-xs space-y-1">
                      {formData.address.building && (
                        <div><span className="font-semibold">Building:</span> {formData.address.building}</div>
                      )}
                      {formData.address.streetNumber && formData.address.street && (
                        <div><span className="font-semibold">Address:</span> {formData.address.streetNumber} {formData.address.street}</div>
                      )}
                      {formData.address.zone && (
                        <div><span className="font-semibold">Zone:</span> {formData.address.zone}</div>
                      )}
                      {formData.address.district && (
                        <div><span className="font-semibold">District:</span> {formData.address.district}</div>
                      )}
                      {formData.address.city && (
                        <div><span className="font-semibold">City:</span> {formData.address.city}, Qatar 🇶🇦</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-gray-600 text-xs font-semibold mb-1">Guests</div>
                      <div className="text-gray-900 font-bold text-lg">{formData.maxGuests}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-gray-600 text-xs font-semibold mb-1">Bedrooms</div>
                      <div className="text-gray-900 font-bold text-lg">{formData.bedrooms}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-gray-600 text-xs font-semibold mb-1">Bathrooms</div>
                      <div className="text-gray-900 font-bold text-lg">{formData.bathrooms}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 font-semibold">Amenities:</span>
                    <span className="text-gray-900 font-bold">{formData.amenities.length} selected</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <span className="text-lg font-bold text-gray-900">Price per night:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${formData.basePrice + formData.cleaningFee + formData.serviceFee}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-500">
                Step {currentStep} of {STEPS.length}
              </div>
              <div className="hidden sm:block w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps - Compact */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center min-w-[60px]">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      currentStep > step.id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                        : currentStep === step.id
                        ? 'border-indigo-600 text-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-300 text-gray-400 bg-white'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium text-center ${currentStep === step.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step.title.split(' ')[0]}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-1 mx-2 rounded-full transition-all ${
                      currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{STEPS[currentStep - 1].title}</h1>
          <p className="text-base text-gray-600">{STEPS[currentStep - 1].description}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t shadow-lg fixed bottom-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold hover:border-gray-400 hover:shadow-md disabled:hover:shadow-none"
            >
              Previous
            </button>

            {currentStep === STEPS.length ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Publish Listing
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}