namespace Astra.SharedKernel.Domain.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}