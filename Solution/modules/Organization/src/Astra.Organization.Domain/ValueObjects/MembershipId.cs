namespace Astra.Organization.Domain.ValueObjects;

public readonly record struct MembershipId(Guid Value)
{
    public static MembershipId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();

    public static implicit operator Guid(
        MembershipId id)
        => id.Value;

    public static implicit operator MembershipId(
        Guid value)
        => new(value);
}