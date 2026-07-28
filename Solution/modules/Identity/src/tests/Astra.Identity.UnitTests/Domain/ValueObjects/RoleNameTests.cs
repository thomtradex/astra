using Astra.Identity.Domain.ValueObjects;
using Xunit;

namespace Astra.Identity.UnitTests.Domain.ValueObjects;

public sealed class RoleNameTests
{
    [Fact]
    public void Constructor_ShouldTrim()
    {
        var role = new RoleName(" Admin ");

        Assert.Equal("Admin", role.Value);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenEmpty()
    {
        Assert.Throws<ArgumentException>(() =>
            new RoleName(""));
    }

    [Fact]
    public void ImplicitConversion_ShouldReturnString()
    {
        RoleName role = new("Admin");

        string value = role;

        Assert.Equal("Admin", value);
    }
}