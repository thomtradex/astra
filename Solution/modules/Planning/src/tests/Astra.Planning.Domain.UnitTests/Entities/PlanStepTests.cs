using Astra.Planning.Domain.Entities;
using Astra.Planning.Domain.ValueObjects;
using Xunit;

namespace Astra.Planning.Domain.UnitTests.Entities;

public sealed class PlanStepTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var planId = PlanId.New();

        var step = new PlanStep(
            planId,
            "Create API",
            "Implement endpoints",
            1);

        Assert.Equal(planId, step.PlanId);
        Assert.Equal("Create API", step.Title);
        Assert.Equal("Implement endpoints", step.Description);
        Assert.Equal(1, step.Order);
        Assert.False(step.Completed);
    }
}