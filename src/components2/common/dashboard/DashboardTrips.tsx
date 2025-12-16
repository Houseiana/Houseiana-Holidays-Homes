'use client';

import { Calendar, MapPin, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardTrips() {
  // Mock Data
  const trips = [
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      location: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
      checkIn: 'Nov 01, 2024',
      checkOut: 'Nov 05, 2024',
      status: 'confirmed',
      host: 'Sarah Wilson'
    },
    {
      id: '2',
      title: 'Cozy Beach House',
      location: 'Malibu, USA',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop',
      checkIn: 'Dec 15, 2024',
      checkOut: 'Dec 20, 2024',
      status: 'pending',
      host: 'Mike Johnson'
    }
  ];

  const pastTrips = [
    {
      id: '3',
      title: 'Secluded Forest Retreat',
      location: 'Portland, USA',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop',
      checkIn: 'Aug 10, 2024',
      checkOut: 'Aug 15, 2024',
      status: 'completed',
      host: 'Emily Davis'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
        <p className="text-gray-500">Manage your upcoming adventures and view past stays</p>
      </div>

      {/* Upcoming Trips */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="text-orange-600" size={24} />
          Upcoming
        </h2>
        
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 group">
              <div className="w-full md:w-64 h-40 rounded-2xl overflow-hidden relative shrink-0">
                <img 
                  src={trip.image} 
                  alt={trip.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 backdrop-blur-md ${getStatusColor(trip.status)}`}>
                  {getStatusIcon(trip.status)}
                  <span className="capitalize">{trip.status}</span>
                </div>
              </div>
              
              <div className="flex-1 py-2 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{trip.title}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                      <MapPin size={16} />
                      {trip.location}
                    </p>
                  </div>
                  <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    <ChevronRight size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-in</p>
                    <p className="font-bold text-gray-900">{trip.checkIn}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Check-out</p>
                    <p className="font-bold text-gray-900">{trip.checkOut}</p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${trip.host}&background=random`} alt={trip.host} />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Hosted by {trip.host}</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                      Message Host
                    </button>
                    <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past Trips */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="text-gray-400" size={24} />
          Past Trips
        </h2>
        
        <div className="space-y-4">
          {pastTrips.map((trip) => (
            <div key={trip.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 opacity-75 hover:opacity-100">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden relative shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                <img 
                  src={trip.image} 
                  alt={trip.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 py-2">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{trip.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{trip.location}</p>
                <p className="text-sm text-gray-600 mb-4">
                  {trip.checkIn} - {trip.checkOut}
                </p>
                <button className="text-sm font-bold text-orange-600 hover:text-orange-700">
                  Write a Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
