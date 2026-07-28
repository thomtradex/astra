using Astra.Planning.Domain.ValueObjects;
using Xunit;

namespace Astra.Planning.Domain.UnitTests.ValueObjects;

public sealed class PlanIdTests
{
    [Fact]
    public void New_Should_Create_Different_Ids()
    {
        var a = PlanId.New();
        var b = PlanId.New();

        Assert.NotEqual(a, b);
    }
}