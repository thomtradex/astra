namespace Astra.Organization.Domain.ValueObjects;

public readonly record struct OrganizationId(Guid Value)
{
    public static OrganizationId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();

    public static implicit operator Guid(
        OrganizationId id)
        => id.Value;

    public static implicit operator OrganizationId(
        Guid value)
        => new(value);
}