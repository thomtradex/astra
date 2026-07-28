using Astra.Marketplace.Domain.ValueObjects;
using Xunit;

namespace Astra.Marketplace.Domain.UnitTests.ValueObjects;

public sealed class PluginIdTests
{
    [Fact]
    public void New_Should_Create_Unique_Id()
    {
        var id1 = PluginId.New();
        var id2 = PluginId.New();

        Assert.NotEqual(id1, id2);
    }
}