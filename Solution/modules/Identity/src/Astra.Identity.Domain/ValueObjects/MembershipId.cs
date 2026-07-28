namespace Astra.Identity.Domain.ValueObjects;

public readonly record struct MembershipId(Guid Value)
{
    public static MembershipId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}