using Astra.SharedKernel.Application.Interfaces;

namespace Astra.SharedKernel.Infrastructure.Email;

public sealed class EmailSender : IEmailSender
{
    public Task SendAsync(
        EmailMessage message,
        CancellationToken cancellationToken = default)
    {
        // Placeholder.
        // Futuramente:
        // - SMTP
        // - Microsoft Graph
        // - SendGrid
        // - Amazon SES
        // - Resend
        // - Azure Communication Services

        return Task.CompletedTask;
    }
}