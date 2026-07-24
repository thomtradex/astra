using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Domain.Entities;

public sealed class Membership
{
    public MembershipId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public Guid UserId { get; private set; }

    public string Role { get; private set; }

    public DateTime JoinedAtUtc { get; private set; }

    private Membership()
    {
    }

    public Membership(
        MembershipId id,
        OrganizationId organizationId,
        Guid userId,
        string role,
        DateTime joinedAtUtc)
    {
        Id = id;
        OrganizationId = organizationId;
        UserId = userId;
        Role = role;
        JoinedAtUtc = joinedAtUtc;
    }

    public void ChangeRole(
        string role)
    {
        Role = role;
    }
}