using NetArchTest.Rules;
using Xunit;

namespace Astra.Gateway.ArchitectureTests.Layering;

public class LayeringTests
{
    [Fact]
    public void Domain_Should_Not_Depend_On_Application_Or_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Astra.Gateway.Domain.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "Astra.Gateway.Application",
                "Astra.Gateway.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }

    [Fact]
    public void Application_Should_Not_Depend_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Astra.Gateway.Application.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Gateway.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}
