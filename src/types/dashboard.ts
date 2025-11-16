export interface DashboardStats {
  totalTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  savedProperties: number;
  travelPoints: number;
  totalSpentThisYear: number;
  totalSpentAllTime: number;
  countriesVisited: number;
  citiesVisited: number;
  totalNights: number;
  averageRating: number;
  yearOverYearGrowth: {
    trips: number;
    spending: number;
    destinations: number;
  };
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionUrl: string;
  badge?: string | number;
  isEnabled: boolean;
  priority: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'list' | 'card';
  position: number;
  isVisible: boolean;
  isLoading: boolean;
  error?: string;
  data?: any;
  preferences?: {
    refreshInterval?: number; // minutes
    displayMode?: string;
    filters?: Record<string, any>;
  };
}

export interface DashboardPersonalization {
  welcomeMessage: string;
  suggestedActions: QuickAction[];
  featuredContent: any[];
  customizations: {
    theme: 'light' | 'dark' | 'auto';
    layout: 'compact' | 'comfortable' | 'spacious';
    widgetOrder: string[];
    hiddenWidgets: string[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
