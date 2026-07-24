using NetArchTest.Rules;
using Astra.Identity.Domain;
using Xunit;

namespace Astra.Identity.ArchitectureTests.Layering;

public class DomainLayerTests
{
    [Fact]
    public void Domain_Should_Not_Depend_On_Infrastructure()
    {
        var result = Types
            .InAssembly(typeof(IdentityModule).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Astra.Identity.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}