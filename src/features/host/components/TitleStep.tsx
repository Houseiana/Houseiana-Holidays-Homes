import { PropertyFormData } from '../types';

interface TitleStepProps {
  listing: PropertyFormData;
  setListing: (listing: PropertyFormData) => void;
}

export const TitleStep = ({ listing, setListing }: TitleStepProps) => (
  <div>
    <textarea
      value={listing.title}
      onChange={(e) => setListing({ ...listing, title: e.target.value.slice(0, 32) })}
      placeholder="Lovely 2-bedroom flat in Doha"
      maxLength={32}
      rows={3}
      className="w-full px-0 py-0 border-0 focus:ring-0 outline-none text-3xl lg:text-4xl font-semibold placeholder-gray-300 resize-none"
    />
    <p className="text-sm text-gray-500 mt-4">{listing.title.length}/32</p>
  </div>
);
