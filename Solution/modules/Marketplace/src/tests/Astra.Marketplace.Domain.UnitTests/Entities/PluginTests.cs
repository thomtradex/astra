using Astra.Marketplace.Domain.Entities;
using Astra.Organization.Domain.ValueObjects;
using Xunit;

namespace Astra.Marketplace.Domain.UnitTests.Entities;

public sealed class PluginTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var organizationId = OrganizationId.New();

        var plugin = new Plugin(
            organizationId,
            "OpenAI",
            "1.0.0",
            "Plugin");

        Assert.Equal(organizationId, plugin.OrganizationId);
        Assert.Equal("OpenAI", plugin.Name);
        Assert.Equal("1.0.0", plugin.Version);
        Assert.Equal("Plugin", plugin.Description);
        Assert.True(plugin.Enabled);
        Assert.NotEqual(default, plugin.CreatedAtUtc);
        Assert.NotEqual(default, plugin.Id);
    }
}