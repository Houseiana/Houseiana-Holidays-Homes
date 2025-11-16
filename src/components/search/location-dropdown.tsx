'use client';

interface QatarCity {
  name: string;
  nameArabic: string;
  description: string;
  icon: string;
}

const qatarCities: QatarCity[] = [
  {
    name: 'Ad Dawhah',
    nameArabic: 'الدوحة',
    description: 'Capital city with modern skyline and cultural attractions',
    icon: '🏙️'
  },
  {
    name: 'Al Rayyan',
    nameArabic: 'الريان',
    description: 'Historic city with traditional architecture and sports venues',
    icon: '🏛️'
  },
  {
    name: 'Al Wakrah',
    nameArabic: 'الوكرة',
    description: 'Coastal city with traditional souks and beautiful waterfront',
    icon: '🏖️'
  },
  {
    name: 'Umm Salal',
    nameArabic: 'أم صلال',
    description: 'Traditional area with historical sites and family communities',
    icon: '🏘️'
  },
  {
    name: 'Al Khor',
    nameArabic: 'الخور',
    description: 'Northern coastal city with fishing heritage and resorts',
    icon: '🐟'
  },
  {
    name: 'Al Shamal',
    nameArabic: 'الشمال',
    description: 'Northernmost region with pristine beaches and nature',
    icon: '🏔️'
  },
  {
    name: 'Al-Shahaniya',
    nameArabic: 'الشحانية',
    description: 'Desert region known for camel racing and adventure tourism',
    icon: '🐪'
  },
  {
    name: 'Al Daayen',
    nameArabic: 'الضعاين',
    description: 'Growing urban area with modern developments',
    icon: '🌆'
  }
];

interface LocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}

export default function LocationDropdown({ onChange, onClose }: LocationDropdownProps) {
  // Handle undefined onClose
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleCitySelect = (cityName: string) => {
    onChange(cityName);
    handleClose();
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
      {/* Cities List */}
      <div className="max-h-64 overflow-y-auto">
        {qatarCities.map((city) => (
          <button
            key={city.name}
            onClick={() => handleCitySelect(city.name)}
            className="w-full flex items-center p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
          >
            <span className="text-lg mr-3 flex-shrink-0">{city.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {city.name}
                </h4>
                <span className="text-xs text-gray-500 ml-2">
                  {city.nameArabic}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {city.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}