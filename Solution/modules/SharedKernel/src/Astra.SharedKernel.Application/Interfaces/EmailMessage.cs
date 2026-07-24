namespace Astra.SharedKernel.Application.Interfaces;

public sealed record EmailMessage(
    string To,
    string Subject,
    string Body);