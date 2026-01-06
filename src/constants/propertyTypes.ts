/**
 * Property Types - Airbnb-style categories
 * Updated to match Prisma PropertyType enum
 */

export const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'BARN', label: 'Barn' },
  { value: 'BED_AND_BREAKFAST', label: 'Bed & breakfast' },
  { value: 'BOAT', label: 'Boat' },
  { value: 'BUNGALOW', label: 'Bungalow' },
  { value: 'CABIN', label: 'Cabin' },
  { value: 'CAMPER_RV', label: 'Camper/RV' },
  { value: 'CASA_PARTICULAR', label: 'Casa particular' },
  { value: 'CASTLE', label: 'Castle' },
  { value: 'CAVE', label: 'Cave' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'CONTAINER', label: 'Container' },
  { value: 'CYCLADIC_HOME', label: 'Cycladic home' },
  { value: 'DAMMUSO', label: 'Dammuso' },
  { value: 'DOME', label: 'Dome' },
  { value: 'EARTH_HOME', label: 'Earth home' },
  { value: 'FARM', label: 'Farm' },
  { value: 'GUESTHOUSE', label: 'Guesthouse' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'HOUSE', label: 'House' },
  { value: 'HOUSEBOAT', label: 'Houseboat' },
  { value: 'KEZHAN', label: 'Kezhan' },
  { value: 'LOFT', label: 'Loft' },
  { value: 'MINSU', label: 'Minsu' },
  { value: 'RIAD', label: 'Riad' },
  { value: 'RYOKAN', label: 'Ryokan' },
  { value: 'SHEPHERDS_HUT', label: "Shepherd's hut" },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'TENT', label: 'Tent' },
  { value: 'TINY_HOME', label: 'Tiny home' },
  { value: 'TOWER', label: 'Tower' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'TREEHOUSE', label: 'Treehouse' },
  { value: 'TRULLO', label: 'Trullo' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'WINDMILL', label: 'Windmill' },
  { value: 'YURT', label: 'Yurt' },
  { value: 'OTHER', label: 'Other' },
] as const;

export type PropertyTypeValue = typeof PROPERTY_TYPES[number]['value'];

// Helper function to get label from value
export function getPropertyTypeLabel(value: string): string {
  const type = PROPERTY_TYPES.find(t => t.value === value);
  return type?.label || value;
}

// Helper function to format enum value to display label
export function formatPropertyType(enumValue: string): string {
  return getPropertyTypeLabel(enumValue);
}

// Export just the values for TypeScript type checking
export const PROPERTY_TYPE_VALUES = PROPERTY_TYPES.map(t => t.value);
