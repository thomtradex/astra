namespace Astra.SharedKernel.Application.Interfaces;

public interface IValidationResult
{
    bool IsValid { get; }

    IReadOnlyCollection<IValidationFailure> Errors { get; }
}