namespace Astra.Identity.Domain.ValueObjects;

public readonly record struct UserRoleId(Guid Value)
{
    public static UserRoleId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}