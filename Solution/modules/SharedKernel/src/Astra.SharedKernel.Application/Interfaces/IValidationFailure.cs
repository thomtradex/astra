namespace Astra.SharedKernel.Application.Interfaces;

public interface IValidationFailure
{
    string PropertyName { get; }

    string ErrorMessage { get; }
}