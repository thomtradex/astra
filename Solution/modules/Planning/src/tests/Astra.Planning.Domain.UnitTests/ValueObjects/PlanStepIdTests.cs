using Astra.Planning.Domain.ValueObjects;
using Xunit;

namespace Astra.Planning.Domain.UnitTests.ValueObjects;

public sealed class PlanStepIdTests
{
    [Fact]
    public void New_Should_Create_Different_Ids()
    {
        var a = PlanStepId.New();
        var b = PlanStepId.New();

        Assert.NotEqual(a, b);
    }
}