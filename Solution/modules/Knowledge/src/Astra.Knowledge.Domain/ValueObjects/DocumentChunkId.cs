namespace Astra.Knowledge.Domain.ValueObjects;

public readonly record struct DocumentChunkId(Guid Value)
{
    public static DocumentChunkId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();

    public static implicit operator Guid(
        DocumentChunkId id)
        => id.Value;

    public static implicit operator DocumentChunkId(
        Guid value)
        => new(value);
}