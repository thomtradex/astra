namespace Astra.SharedKernel.Application.Interfaces;

public interface IValidator<in T>
{
    Task<IValidationResult> ValidateAsync(
        T instance,
        CancellationToken cancellationToken = default);
}