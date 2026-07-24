using NetArchTest.Rules;
using Xunit;

namespace Astra.Knowledge.ArchitectureTests.Layering;

public class Domain_Should_Not_Depend_On_Application
{
    [Fact]
    public void Domain_Should_Not_Have_Dependency_On_Application()
    {
        var result = Types.InAssembly(typeof(Astra.Knowledge.Domain.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Knowledge.Application")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}