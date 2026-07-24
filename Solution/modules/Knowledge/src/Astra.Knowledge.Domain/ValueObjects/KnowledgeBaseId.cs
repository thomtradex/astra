namespace Astra.Knowledge.Domain.ValueObjects;

public readonly record struct KnowledgeBaseId(Guid Value)
{
    public static KnowledgeBaseId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();

    public static implicit operator Guid(
        KnowledgeBaseId id)
        => id.Value;

    public static implicit operator KnowledgeBaseId(
        Guid value)
        => new(value);
}