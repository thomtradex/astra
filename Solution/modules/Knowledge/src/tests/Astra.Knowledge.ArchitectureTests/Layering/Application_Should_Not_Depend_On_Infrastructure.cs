using NetArchTest.Rules;
using Xunit;

namespace Astra.Knowledge.ArchitectureTests.Layering;

public class Application_Should_Not_Depend_On_Infrastructure
{
    [Fact]
    public void Application_Should_Not_Have_Dependency_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Astra.Knowledge.Application.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Knowledge.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}