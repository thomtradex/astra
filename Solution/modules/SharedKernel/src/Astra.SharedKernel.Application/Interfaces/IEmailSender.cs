namespace Astra.SharedKernel.Application.Interfaces;

public interface IEmailSender
{
    Task SendAsync(
        EmailMessage message,
        CancellationToken cancellationToken = default);
}