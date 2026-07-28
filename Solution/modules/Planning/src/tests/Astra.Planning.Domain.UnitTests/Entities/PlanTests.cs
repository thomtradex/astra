using Astra.Organization.Domain.ValueObjects;
using Astra.Planning.Domain.Entities;
using Xunit;

namespace Astra.Planning.Domain.UnitTests.Entities;

public sealed class PlanTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var organizationId = OrganizationId.New();

        var plan = new Plan(
            organizationId,
            "Roadmap",
            "Finish MVP");

        Assert.Equal(organizationId, plan.OrganizationId);
        Assert.Equal("Roadmap", plan.Name);
        Assert.Equal("Finish MVP", plan.Goal);
    }
}