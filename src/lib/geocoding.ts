/**
 * Geocoding Utility
 * Converts addresses to latitude/longitude coordinates using OpenStreetMap Nominatim API
 * This is a free geocoding service - no API key required
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Geocode an address to get latitude and longitude
 * @param address Full address string
 * @param city City name
 * @param country Country name
 * @returns Promise with coordinates or null if geocoding fails
 */
export async function geocodeAddress(
  address: string,
  city: string,
  country: string
): Promise<GeocodingResult | null> {
  try {
    // Build the search query
    const query = `${address}, ${city}, ${country}`;

    // Use Nominatim (OpenStreetMap) geocoding API
    // Free to use with proper attribution
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1`;

    console.log('🌍 Geocoding address:', query);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Houseiana Property Rental Platform', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.error('❌ Geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log('⚠️ No geocoding results found for:', query);
      return null;
    }

    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    console.log('✅ Geocoded successfully:', {
      latitude,
      longitude,
      displayName: result.display_name,
    });

    return {
      latitude,
      longitude,
      displayName: result.display_name,
    };
  } catch (error) {
    console.error('❌ Error geocoding address:', error);
    return null;
  }
}

/**
 * Geocode just a city and country (for partial addresses)
 * @param city City name
 * @param country Country name
 * @returns Promise with coordinates or null if geocoding fails
 */
export async function geocodeCity(
  city: string,
  country: string
): Promise<GeocodingResult | null> {
  try {
    const query = `${city}, ${country}`;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=1`;

    console.log('🌍 Geocoding city:', query);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Houseiana Property Rental Platform',
      },
    });

    if (!response.ok) {
      console.error('❌ Geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log('⚠️ No geocoding results found for:', query);
      return null;
    }

    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    console.log('✅ Geocoded city successfully:', {
      latitude,
      longitude,
      displayName: result.display_name,
    });

    return {
      latitude,
      longitude,
      displayName: result.display_name,
    };
  } catch (error) {
    console.error('❌ Error geocoding city:', error);
    return null;
  }
}

/**
 * Validate coordinates
 * @param latitude Latitude value
 * @param longitude Longitude value
 * @returns true if coordinates are valid
 */
export function validateCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): boolean {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }

  // Latitude must be between -90 and 90
  // Longitude must be between -180 and 180
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
