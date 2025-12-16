'use client';

import { User, Mail, Phone, MapPin, Shield, Bell, Globe, Camera } from 'lucide-react';

export default function DashboardProfile() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src="https://i.pravatar.cc/300?img=3" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full shadow-md hover:bg-orange-700 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">John Doe</h2>
            <p className="text-gray-500 text-sm mb-4">Premium Member</p>
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Verified Identity</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Verification Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Identity Verified</span>
                </div>
                <span className="text-green-500 text-xs font-bold">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Email Confirmed</span>
                </div>
                <span className="text-green-500 text-xs font-bold">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Phone Verified</span>
                </div>
                <span className="text-green-500 text-xs font-bold">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    defaultValue="John"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    defaultValue="Doe"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    defaultValue="john.doe@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    defaultValue="123 Main St, New York, NY 10001"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
                Save Changes
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Bell size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Notifications</h4>
                    <p className="text-xs text-gray-500">Receive updates about your bookings</p>
                  </div>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer bg-green-500">
                  <span className="absolute left-0 inline-block w-6 h-6 bg-white border border-gray-200 rounded-full shadow transform translate-x-6 transition-transform duration-200 ease-in-out"></span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Globe size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Language & Currency</h4>
                    <p className="text-xs text-gray-500">English (US) - USD ($)</p>
                  </div>
                </div>
                <button className="text-sm font-bold text-orange-600 hover:text-orange-700">Edit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
