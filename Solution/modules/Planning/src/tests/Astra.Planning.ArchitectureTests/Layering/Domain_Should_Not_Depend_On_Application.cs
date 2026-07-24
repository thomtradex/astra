using NetArchTest.Rules;
using Xunit;

namespace Astra.Planning.ArchitectureTests.Layering;

public class Domain_Should_Not_Depend_On_Application
{
    [Fact]
    public void Domain_Should_Not_Have_Dependency_On_Application()
    {
        var result = Types.InAssembly(typeof(Astra.Planning.Domain.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Planning.Application")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}
