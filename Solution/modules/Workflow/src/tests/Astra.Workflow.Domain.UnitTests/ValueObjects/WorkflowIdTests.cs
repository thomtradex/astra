using Astra.Workflow.Domain.ValueObjects;
using Xunit;

namespace Astra.Workflow.Domain.UnitTests.ValueObjects;

public sealed class WorkflowIdTests
{
    [Fact]
    public void New_Should_Generate_Different_Ids()
    {
        var id1 = WorkflowId.New();
        var id2 = WorkflowId.New();

        Assert.NotEqual(id1, id2);
    }
}
