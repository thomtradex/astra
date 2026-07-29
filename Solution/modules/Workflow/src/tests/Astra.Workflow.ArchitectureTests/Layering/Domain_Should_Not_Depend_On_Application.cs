using NetArchTest.Rules;
using Xunit;

namespace Astra.Workflow.ArchitectureTests.Layering;

public sealed class Domain_Should_Not_Depend_On_Application
{
    [Fact]
    public void Domain_Should_Not_Have_Dependency_On_Application()
    {
        var result = Types.InAssembly(typeof(Astra.Workflow.Domain.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Workflow.Application")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}