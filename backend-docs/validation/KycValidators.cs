using FluentValidation;
using Houseiana.Api.Contracts.Compliance;

namespace Houseiana.Api.Validation.Compliance
{
    public class KycInitiateValidator : AbstractValidator<KycInitiateDto>
    {
        public KycInitiateValidator()
        {
            RuleFor(x => x.Provider)
                .NotEmpty().WithMessage("KYC provider is required")
                .Must(BeValidProvider).WithMessage("Provider must be one of: veriff, onfido, persona, sumsub");
        }

        private static bool BeValidProvider(string provider)
        {
            var validProviders = new[] { "veriff", "onfido", "persona", "sumsub" };
            return validProviders.Contains(provider?.ToLower());
        }
    }

    public class KycDocumentUploadValidator : AbstractValidator<KycDocumentUploadDto>
    {
        public KycDocumentUploadValidator()
        {
            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Document type is required")
                .Must(BeValidDocumentType).WithMessage("Type must be one of: passport, license, bank_statement, utility_bill");

            RuleFor(x => x.File)
                .NotNull().WithMessage("Document file is required")
                .Must(BeValidFileSize).WithMessage("File size must be less than 10MB")
                .Must(BeValidFileType).WithMessage("File must be PDF, JPG, or PNG");
        }

        private static bool BeValidDocumentType(string type)
        {
            var validTypes = new[] { "passport", "license", "bank_statement", "utility_bill", "business_registration" };
            return validTypes.Contains(type?.ToLower());
        }

        private static bool BeValidFileSize(IFormFile? file)
        {
            if (file == null) return false;
            return file.Length <= 10 * 1024 * 1024; // 10MB max
        }

        private static bool BeValidFileType(IFormFile? file)
        {
            if (file == null) return false;

            var validContentTypes = new[]
            {
                "application/pdf",
                "image/jpeg",
                "image/jpg",
                "image/png"
            };

            return validContentTypes.Contains(file.ContentType?.ToLower());
        }
    }

    public class LicenseCreateValidator : AbstractValidator<LicenseCreateDto>
    {
        public LicenseCreateValidator()
        {
            RuleFor(x => x.Jurisdiction)
                .NotEmpty().WithMessage("Jurisdiction is required")
                .MinimumLength(2).WithMessage("Jurisdiction must be at least 2 characters")
                .MaximumLength(100).WithMessage("Jurisdiction cannot exceed 100 characters");

            RuleFor(x => x.Number)
                .NotEmpty().WithMessage("License number is required")
                .MinimumLength(3).WithMessage("License number must be at least 3 characters")
                .MaximumLength(50).WithMessage("License number cannot exceed 50 characters");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("License type is required")
                .Must(BeValidLicenseType).WithMessage("Type must be one of: business, rental, hospitality, tourism");
        }

        private static bool BeValidLicenseType(string type)
        {
            var validTypes = new[] { "business", "rental", "hospitality", "tourism", "short_term_rental" };
            return validTypes.Contains(type?.ToLower());
        }
    }
}