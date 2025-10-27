using FluentValidation;
using Houseiana.Api.Contracts.Messaging;

namespace Houseiana.Api.Validation.Messaging
{
    public class ThreadCreateValidator : AbstractValidator<ThreadCreateDto>
    {
        public ThreadCreateValidator()
        {
            RuleFor(x => x.GuestId)
                .NotEmpty().WithMessage("Guest ID is required");

            RuleFor(x => x.Channel)
                .NotEmpty().WithMessage("Channel is required")
                .Must(BeValidChannel).WithMessage("Channel must be one of: inbox, whatsapp, email");

            RuleFor(x => x.InitialMessage)
                .NotEmpty().WithMessage("Initial message is required")
                .MinimumLength(1).WithMessage("Message cannot be empty")
                .MaximumLength(5000).WithMessage("Message cannot exceed 5000 characters");
        }

        private static bool BeValidChannel(string channel)
        {
            var validChannels = new[] { "inbox", "whatsapp", "email" };
            return validChannels.Contains(channel?.ToLower());
        }
    }

    public class MessageCreateValidator : AbstractValidator<MessageCreateDto>
    {
        public MessageCreateValidator()
        {
            RuleFor(x => x.Body)
                .NotEmpty().WithMessage("Message body is required")
                .MinimumLength(1).WithMessage("Message cannot be empty")
                .MaximumLength(5000).WithMessage("Message cannot exceed 5000 characters");

            RuleFor(x => x.Attachments)
                .Must(HaveValidAttachments).WithMessage("Invalid attachment format")
                .When(x => x.Attachments != null && x.Attachments.Any());
        }

        private static bool HaveValidAttachments(IEnumerable<AttachmentDto>? attachments)
        {
            if (attachments == null) return true;

            return attachments.All(a =>
                !string.IsNullOrWhiteSpace(a.Url) &&
                !string.IsNullOrWhiteSpace(a.Name) &&
                Uri.TryCreate(a.Url, UriKind.Absolute, out _));
        }
    }
}