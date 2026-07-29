using Astra.Agents.Domain.Entities;
using Astra.Organization.Domain.ValueObjects;
using Xunit;

namespace Astra.Agents.Domain.UnitTests.Entities;

public sealed class AgentCapabilityTests
{
    [Fact]
    public void Constructor_Should_InitializeProperties()
    {
        var agent = new Agent(
            OrganizationId.New(),
            "Finance Agent",
            "Handles financial tasks");

        var capability = new AgentCapability(
            agent.Id,
            "Invoices",
            "Processes invoices");

        Assert.Equal(agent.Id, capability.AgentId);
        Assert.Equal("Invoices", capability.Name);
        Assert.Equal("Processes invoices", capability.Description);

        Assert.NotEqual(Guid.Empty, capability.Id.Value);
    }
}