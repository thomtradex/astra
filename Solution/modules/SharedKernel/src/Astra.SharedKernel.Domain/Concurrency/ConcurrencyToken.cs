namespace Astra.SharedKernel.Domain.Concurrency;

public sealed class ConcurrencyToken
{
    public Guid Value { get; private set; }

    public ConcurrencyToken()
    {
        Value = Guid.NewGuid();
    }

    public void Refresh()
    {
        Value = Guid.NewGuid();
    }
}