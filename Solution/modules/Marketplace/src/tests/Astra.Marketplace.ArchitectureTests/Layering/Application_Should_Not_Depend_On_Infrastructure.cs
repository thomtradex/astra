using NetArchTest.Rules;
using Xunit;

namespace Astra.Marketplace.ArchitectureTests.Layering;

public sealed class Application_Should_Not_Depend_On_Infrastructure
{
    [Fact]
    public void Application_Should_Not_Have_Dependency_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Astra.Marketplace.Application.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Marketplace.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}