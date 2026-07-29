using NetArchTest.Rules;
using Xunit;

namespace Astra.AI.ArchitectureTests.Layering;

public sealed class Application_Should_Not_Depend_On_Infrastructure
{
    [Fact]
    public void Application_Should_Not_Have_Dependency_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Astra.AI.Application.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.AI.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}