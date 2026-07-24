namespace Astra.SharedKernel.Application.Interfaces;

public interface IAuthorizationResult
{
    bool Succeeded { get; }

    string? FailureReason { get; }
}