namespace Astra.SharedKernel.Domain.Validation;

public sealed class ValidationResult
{
    public IReadOnlyCollection<ValidationError> Errors { get; }

    public bool IsValid => Errors.Count == 0;

    public ValidationResult(
        IReadOnlyCollection<ValidationError> errors)
    {
        Errors = errors;
    }

    public static ValidationResult Success
        => new([]);
}