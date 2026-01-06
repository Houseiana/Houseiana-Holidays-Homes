import { PropertyFormData } from '../types';
import { Counter } from './Counter';

interface BasicsStepProps {
  listing: PropertyFormData;
  updateCounter: (field: keyof PropertyFormData, delta: number) => void;
}

export const BasicsStep = ({ listing, updateCounter }: BasicsStepProps) => (
  <div>
    <Counter 
      label="Guests" 
      value={listing.guests} 
      field="guests" 
      max={20}
      onChange={(field, delta) => updateCounter(field as keyof PropertyFormData, delta)} 
    />
    <Counter 
      label="Bedrooms" 
      value={listing.bedrooms} 
      field="bedrooms" 
      max={10}
      onChange={(field, delta) => updateCounter(field as keyof PropertyFormData, delta)} 
    />
    <Counter 
      label="Beds" 
      value={listing.beds} 
      field="beds" 
      max={20}
      onChange={(field, delta) => updateCounter(field as keyof PropertyFormData, delta)} 
    />
    <Counter 
      label="Bathrooms" 
      value={listing.bathrooms} 
      field="bathrooms" 
      min={0.5} 
      max={5}
      step={0.5} 
      onChange={(field, delta) => updateCounter(field as keyof PropertyFormData, delta)} 
    />
  </div>
);
