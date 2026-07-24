using NetArchTest.Rules;
using Xunit;

namespace Astra.Identity.ArchitectureTests.Naming;

public class RepositoryNamingTests
{
    [Fact]
    public void Repositories_Should_Be_Interfaces()
    {
        var result = Types.InAssembly(typeof(Astra.Identity.Domain.Repositories.IUserRepository).Assembly)
            .That()
            .ResideInNamespace("Astra.Identity.Domain.Repositories")
            .Should()
            .BeInterfaces()
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}
