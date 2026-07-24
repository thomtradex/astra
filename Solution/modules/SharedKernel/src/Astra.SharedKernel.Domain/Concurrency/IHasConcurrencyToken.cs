namespace Astra.SharedKernel.Domain.Concurrency;

public interface IHasConcurrencyToken
{
    ConcurrencyToken ConcurrencyToken { get; }
}