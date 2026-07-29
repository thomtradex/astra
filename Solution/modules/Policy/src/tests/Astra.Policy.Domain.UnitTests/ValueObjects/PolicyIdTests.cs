using Astra.Policy.Domain.ValueObjects;
using Xunit;

namespace Astra.Policy.Domain.UnitTests.ValueObjects;

public sealed class PolicyIdTests
{
    [Fact]
    public void New_Should_Create_Different_Ids()
    {
        var a = PolicyId.New();
        var b = PolicyId.New();

        Assert.NotEqual(a, b);
    }
}
