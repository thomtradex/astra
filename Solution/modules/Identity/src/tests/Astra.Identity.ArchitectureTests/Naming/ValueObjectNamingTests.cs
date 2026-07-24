using NetArchTest.Rules;
using Xunit;

namespace Astra.Identity.ArchitectureTests.Naming;

public class ValueObjectNamingTests
{
    [Fact]
    public void ValueObjects_Should_End_With_Id_Or_Be_Named_Correctly()
    {
        var invalidTypes = Types.InAssembly(typeof(Astra.Identity.Domain.ValueObjects.RoleId).Assembly)
            .That()
            .ResideInNamespace("Astra.Identity.Domain.ValueObjects")
            .GetTypes()
            .Where(t =>
                !t.IsAbstract &&
                !t.Name.EndsWith("Id") &&
                t.Name != "Email" &&
                t.Name != "FullName" &&
                t.Name != "PasswordHash" &&
                t.Name != "RoleName" &&
                t.Name != "PermissionName")
            .ToList();

        Assert.True(
            invalidTypes.Count == 0,
            $"Invalid ValueObjects: {string.Join(", ", invalidTypes.Select(x => x.Name))}");
    }
}