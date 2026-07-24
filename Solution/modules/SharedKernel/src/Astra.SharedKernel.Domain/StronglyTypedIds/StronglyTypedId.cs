namespace Astra.SharedKernel.Domain.StronglyTypedIds;

public abstract record StronglyTypedId
{
    public Guid Value { get; }

    protected StronglyTypedId(Guid value)
    {
        Value = value;
    }

    public override string ToString()
        => Value.ToString();

    public static implicit operator Guid(StronglyTypedId id)
        => id.Value;
}