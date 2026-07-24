namespace Astra.Knowledge.Domain.ValueObjects;

public readonly record struct DocumentId(Guid Value)
{
    public static DocumentId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();

    public static implicit operator Guid(
        DocumentId id)
        => id.Value;

    public static implicit operator DocumentId(
        Guid value)
        => new(value);
}