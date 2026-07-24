namespace Astra.Identity.Domain.ValueObjects;

public readonly record struct RolePermissionId(Guid Value)
{
    public static RolePermissionId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}