using NetArchTest.Rules;
using Xunit;

namespace Astra.Policy.ArchitectureTests.Layering;

public class Application_Should_Not_Depend_On_Infrastructure
{
    [Fact]
    public void Application_Should_Not_Have_Dependency_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Astra.Policy.Application.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Policy.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}
