using FluentValidation;
using Houseiana.Api.Contracts.Finance;

namespace Houseiana.Api.Validation.Finance
{
    public class PayoutAccountCreateValidator : AbstractValidator<PayoutAccountCreateDto>
    {
        public PayoutAccountCreateValidator()
        {
            RuleFor(x => x.Provider)
                .NotEmpty().WithMessage("Provider is required")
                .Must(BeValidProvider).WithMessage("Provider must be one of: stripe, payoneer, bank");

            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Token is required")
                .MinimumLength(10).WithMessage("Token appears to be invalid");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Currency is required")
                .Length(3).WithMessage("Currency must be a 3-letter ISO code")
                .Must(BeValidCurrency).WithMessage("Invalid currency code");
        }

        private static bool BeValidProvider(string provider)
        {
            var validProviders = new[] { "stripe", "payoneer", "bank" };
            return validProviders.Contains(provider?.ToLower());
        }

        private static bool BeValidCurrency(string currency)
        {
            var validCurrencies = new[] { "USD", "EUR", "GBP", "CAD", "AUD", "QAR" };
            return validCurrencies.Contains(currency?.ToUpper());
        }
    }

    public class TransactionCreateValidator : AbstractValidator<TransactionCreateDto>
    {
        public TransactionCreateValidator()
        {
            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Transaction type is required")
                .Must(BeValidTransactionType).WithMessage("Type must be one of: charge, refund, fee, tax, adjustment");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Amount must be greater than 0")
                .LessThanOrEqualTo(1000000).WithMessage("Amount cannot exceed 1,000,000");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Currency is required")
                .Length(3).WithMessage("Currency must be a 3-letter ISO code");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.BookingId)
                .NotEmpty().WithMessage("Booking ID is required for transaction")
                .When(x => x.Type == "charge" || x.Type == "refund");
        }

        private static bool BeValidTransactionType(string type)
        {
            var validTypes = new[] { "charge", "refund", "fee", "tax", "adjustment" };
            return validTypes.Contains(type?.ToLower());
        }
    }

    public class PayoutCreateValidator : AbstractValidator<PayoutCreateDto>
    {
        public PayoutCreateValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Payout amount must be greater than 0")
                .LessThanOrEqualTo(100000).WithMessage("Payout amount cannot exceed 100,000");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Currency is required")
                .Length(3).WithMessage("Currency must be a 3-letter ISO code");

            RuleFor(x => x.PayoutAccountId)
                .NotEmpty().WithMessage("Payout account is required");

            RuleFor(x => x.ScheduledFor)
                .GreaterThanOrEqualTo(DateTime.UtcNow).WithMessage("Scheduled date cannot be in the past")
                .When(x => x.ScheduledFor.HasValue);
        }
    }
}