using NetArchTest.Rules;
using Xunit;

namespace Astra.Notifications.ArchitectureTests.Layering;

public sealed class Domain_Should_Not_Depend_On_Application
{
    [Fact]
    public void Domain_Should_Not_Have_Dependency_On_Application()
    {
        var result = Types.InAssembly(typeof(Astra.Notifications.Domain.AssemblyReference).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Notifications.Application")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}