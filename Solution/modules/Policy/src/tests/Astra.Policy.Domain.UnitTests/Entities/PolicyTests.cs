using PolicyEntity = Astra.Policy.Domain.Entities.Policy;
using Xunit;

namespace Astra.Policy.Domain.UnitTests.Entities;

public sealed class PolicyTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var policy = new PolicyEntity(
            "Security",
            "Security policy");

        Assert.Equal("Security", policy.Name);
        Assert.Equal("Security policy", policy.Description);
    }
}