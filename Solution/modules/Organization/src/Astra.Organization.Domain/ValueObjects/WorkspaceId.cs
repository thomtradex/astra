namespace Astra.Organization.Domain.ValueObjects;

public readonly record struct WorkspaceId(Guid Value)
{
    public static WorkspaceId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();

    public static implicit operator Guid(
        WorkspaceId id)
        => id.Value;

    public static implicit operator WorkspaceId(
        Guid value)
        => new(value);
}