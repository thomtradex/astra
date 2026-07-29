using Astra.Projects.Domain.ValueObjects;
using Xunit;

namespace Astra.Projects.Domain.UnitTests.ValueObjects;

public sealed class ProjectIdTests
{
    [Fact]
    public void New_Should_Create_Different_Ids()
    {
        var a = ProjectId.New();
        var b = ProjectId.New();

        Assert.NotEqual(a, b);
    }
}