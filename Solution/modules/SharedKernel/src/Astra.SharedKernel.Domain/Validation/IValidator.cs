namespace Astra.SharedKernel.Domain.Validation;

public interface IValidator<in T>
{
    ValidationResult Validate(
        T instance);
}