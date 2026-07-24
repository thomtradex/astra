using NetArchTest.Rules;
using Xunit;

namespace Astra.CompanyBrain.ArchitectureTests.Naming;

public class RepositoryNamingTests
{
    [Fact]
    public void Repositories_Should_Be_Interfaces()
    {
        var result = Types.InAssembly(typeof(Astra.CompanyBrain.Domain.AssemblyReference).Assembly)
            .That()
            .ResideInNamespaceEndingWith(".Repositories")
            .Should()
            .BeInterfaces()
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}