using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Domain.Entities;

public sealed class Membership
{
    public MembershipId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public Guid UserId { get; private set; }

    public string Role { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private Membership()
    {
        Id = default;
        OrganizationId = default;
        UserId = Guid.Empty;
        Role = string.Empty;
        CreatedAtUtc = default;
    }

    public Membership(
        MembershipId id,
        OrganizationId organizationId,
        Guid userId,
        string role,
        DateTime createdAtUtc)
    {
        Id = id;
        OrganizationId = organizationId;
        UserId = userId;
        Role = role;
        CreatedAtUtc = createdAtUtc;
    }

    public void ChangeRole(string role)
    {
        Role = role;
    }
}