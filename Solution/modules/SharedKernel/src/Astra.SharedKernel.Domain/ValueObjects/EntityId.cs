namespace Astra.SharedKernel.Domain.ValueObjects;

public abstract record EntityId(Guid Value)
{
    public override string ToString()
    {
        return Value.ToString();
    }
}