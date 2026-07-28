using Astra.Identity.Domain.ValueObjects;
using Xunit;

namespace Astra.Identity.UnitTests.Domain.ValueObjects;

public sealed class PermissionNameTests
{
    [Fact]
    public void Constructor_ShouldTrim()
    {
        var permission = new PermissionName(" Users.Read ");

        Assert.Equal("Users.Read", permission.Value);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenEmpty()
    {
        Assert.Throws<ArgumentException>(() =>
            new PermissionName(""));
    }

    [Fact]
    public void ImplicitConversion_ShouldReturnString()
    {
        PermissionName permission = new("Users.Read");

        string value = permission;

        Assert.Equal("Users.Read", value);
    }
}