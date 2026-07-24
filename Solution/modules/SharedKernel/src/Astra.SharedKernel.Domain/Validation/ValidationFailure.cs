namespace Astra.SharedKernel.Domain.Validation;

public sealed class ValidationFailure
{
    public string PropertyName { get; }

    public string ErrorMessage { get; }

    public ValidationFailure(
        string propertyName,
        string errorMessage)
    {
        PropertyName = propertyName;

        ErrorMessage = errorMessage;
    }
}