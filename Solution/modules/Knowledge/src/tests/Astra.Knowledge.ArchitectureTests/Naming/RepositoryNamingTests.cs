using NetArchTest.Rules;
using Xunit;

namespace Astra.Knowledge.ArchitectureTests.Naming;

public class RepositoryNamingTests
{
    [Fact]
    public void Repositories_Should_Be_Interfaces()
    {
        var result = Types.InAssembly(typeof(Astra.Knowledge.Domain.AssemblyReference).Assembly)
            .That()
            .ResideInNamespaceEndingWith(".Repositories")
            .Should()
            .BeInterfaces()
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}