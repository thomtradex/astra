namespace Astra.Identity.Domain.ValueObjects;

public readonly record struct PermissionId(Guid Value)
{
    public static PermissionId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}