using Astra.Organization.Domain.Entities;
using Astra.Organization.Domain.ValueObjects;
using Xunit;

namespace Astra.Organization.Domain.UnitTests.Entities;

public sealed class MembershipTests
{
    [Fact]
    public void Constructor_Should_Create_Instance()
    {
        var membership = new Membership(
            MembershipId.New(),
            OrganizationId.New(),
            Guid.NewGuid(),
            "Admin",
            DateTime.UtcNow);

        Assert.NotNull(membership);
        Assert.Equal("Admin", membership.Role);
    }

    [Fact]
    public void ChangeRole_Should_Update_Role()
    {
        var membership = new Membership(
            MembershipId.New(),
            OrganizationId.New(),
            Guid.NewGuid(),
            "Member",
            DateTime.UtcNow);

        membership.ChangeRole("Owner");

        Assert.Equal("Owner", membership.Role);
    }
}