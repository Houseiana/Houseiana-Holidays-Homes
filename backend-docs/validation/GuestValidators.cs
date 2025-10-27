using FluentValidation;
using Houseiana.Api.Contracts.Crm;

namespace Houseiana.Api.Validation.Crm
{
    public class GuestNoteCreateValidator : AbstractValidator<GuestNoteCreateDto>
    {
        public GuestNoteCreateValidator()
        {
            RuleFor(x => x.Note)
                .NotEmpty().WithMessage("Note content is required")
                .MinimumLength(3).WithMessage("Note must be at least 3 characters")
                .MaximumLength(1000).WithMessage("Note cannot exceed 1000 characters");
        }
    }

    public class GuestCreateValidator : AbstractValidator<GuestCreateDto>
    {
        public GuestCreateValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Guest name is required")
                .MinimumLength(2).WithMessage("Name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Name cannot exceed 255 characters");

            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.Phone)
                .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format")
                .When(x => !string.IsNullOrEmpty(x.Phone));

            RuleFor(x => x.Country)
                .Length(2, 3).WithMessage("Country code must be 2-3 characters")
                .When(x => !string.IsNullOrEmpty(x.Country));
        }
    }

    public class GuestUpdateValidator : AbstractValidator<GuestUpdateDto>
    {
        public GuestUpdateValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Guest name is required")
                .MinimumLength(2).WithMessage("Name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Name cannot exceed 255 characters")
                .When(x => x.Name != null);

            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.Phone)
                .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Invalid phone number format")
                .When(x => !string.IsNullOrEmpty(x.Phone));
        }
    }
}