using Astra.Agents.Domain.Entities;
using Astra.Organization.Domain.ValueObjects;
using Xunit;

namespace Astra.Agents.Domain.UnitTests.Entities;

public sealed class AgentTests
{
    [Fact]
    public void Constructor_Should_InitializeProperties()
    {
        var organizationId = OrganizationId.New();
        var before = DateTime.UtcNow;

        var agent = new Agent(
            organizationId,
            "Finance Agent",
            "Handles financial tasks");

        var after = DateTime.UtcNow;

        Assert.Equal(organizationId, agent.OrganizationId);
        Assert.Equal("Finance Agent", agent.Name);
        Assert.Equal("Handles financial tasks", agent.Description);

        Assert.True(agent.Enabled);

        Assert.NotEqual(Guid.Empty, agent.Id.Value);

        Assert.InRange(
            agent.CreatedAtUtc,
            before,
            after);
    }
}