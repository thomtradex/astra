using Astra.Identity.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Identity.Domain.Entities;

public sealed class Membership
{
    private Membership()
    {
    }

    public Membership(
        Astra.Identity.Domain.ValueObjects.MembershipId id,
        UserId userId,
        OrganizationId organizationId,
        RoleId roleId)
    {
        Id = id;
        UserId = userId;
        OrganizationId = organizationId;
        RoleId = roleId;
    }

    public Astra.Identity.Domain.ValueObjects.MembershipId Id { get; private set; }

    public UserId UserId { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public RoleId RoleId { get; private set; }
}