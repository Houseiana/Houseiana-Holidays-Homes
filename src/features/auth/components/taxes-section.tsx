'use client';

interface TaxesSectionProps {
  onAddTaxInfo?: () => void;
  hasTaxInfo?: boolean;
  taxInfo?: {
    type: string;
    country: string;
    taxId: string;
  };
}

export function TaxesSection({ onAddTaxInfo, hasTaxInfo = false, taxInfo }: TaxesSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Taxes</h2>
      <p className="text-gray-500 text-sm mb-6">
        Taxpayer information is required for hosts. This information is used to file tax documents.
      </p>

      {hasTaxInfo && taxInfo ? (
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{taxInfo.type}</p>
              <p className="text-sm text-gray-500">
                {taxInfo.country} · {taxInfo.taxId}
              </p>
            </div>
            <button
              onClick={onAddTaxInfo}
              className="text-sm font-medium text-teal-600 hover:underline"
            >
              Edit
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onAddTaxInfo}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Add taxpayer information
        </button>
      )}
    </section>
  );
}
