using NetArchTest.Rules;
using Xunit;

namespace Astra.Planning.ArchitectureTests.Layering;

public class Application_Should_Not_Depend_On_Infrastructure
{
    [Fact]
    public void Application_Should_Not_Have_Dependency_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Astra.Planning.Application.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Planning.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}
