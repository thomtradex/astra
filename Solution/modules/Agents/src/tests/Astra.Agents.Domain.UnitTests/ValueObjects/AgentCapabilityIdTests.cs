using Astra.Agents.Domain.ValueObjects;
using Xunit;

namespace Astra.Agents.Domain.UnitTests.ValueObjects;

public sealed class AgentCapabilityIdTests
{
    [Fact]
    public void New_Should_CreateUniqueId()
    {
        var first = AgentCapabilityId.New();
        var second = AgentCapabilityId.New();

        Assert.NotEqual(first, second);
        Assert.NotEqual(Guid.Empty, first.Value);
        Assert.NotEqual(Guid.Empty, second.Value);
    }

    [Fact]
    public void ToString_Should_ReturnGuidString()
    {
        var id = AgentCapabilityId.New();

        Assert.Equal(id.Value.ToString(), id.ToString());
    }
}