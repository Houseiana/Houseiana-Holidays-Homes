import { PropertyAPI, Property } from "@/lib/backend-api";

export interface IListingsParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathroomCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

export interface SafeListing extends Omit<Property, 'createdAt'> {
  createdAt: string;
}

export default async function getListings(params: IListingsParams): Promise<SafeListing[]> {
  try {
    const {
      userId,
      roomCount,
      guestCount,
      bathroomCount,
      locationValue,
      startDate,
      endDate,
      category,
    } = params;

    // Build filters for backend API
    const filters: Record<string, string | number> = {};

    if (userId) {
      filters.userId = userId;
    }

    if (category) {
      filters.category = category;
    }

    if (roomCount) {
      filters.minRooms = +roomCount;
    }

    if (guestCount) {
      filters.minGuests = +guestCount;
    }

    if (bathroomCount) {
      filters.minBathrooms = +bathroomCount;
    }

    if (locationValue) {
      filters.location = locationValue;
    }

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    // Call backend API
    const response = await PropertyAPI.getAll({
      page: 1,
      limit: 100,
      ...filters,
    });

    if (!response.success || !response.data) {
      return [];
    }

    const listings = response.data.data || [];

    // Convert to safe listings format
    const safeListings: SafeListing[] = listings.map((listing: Property) => ({
      ...listing,
      createdAt: String(listing.createdAt),
    }));

    return safeListings;
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}
