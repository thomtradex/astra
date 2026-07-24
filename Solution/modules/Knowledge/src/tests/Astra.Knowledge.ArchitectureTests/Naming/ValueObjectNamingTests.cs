using NetArchTest.Rules;
using Xunit;

namespace Astra.Knowledge.ArchitectureTests.Naming;

public class ValueObjectNamingTests
{
    [Fact]
    public void ValueObjects_Should_End_With_Id()
    {
        var result = Types.InAssembly(typeof(Astra.Knowledge.Domain.AssemblyReference).Assembly)
            .That()
            .ResideInNamespaceEndingWith(".ValueObjects")
            .Should()
            .HaveNameEndingWith("Id")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}