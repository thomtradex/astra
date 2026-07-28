
using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;
using Xunit;

namespace Astra.Identity.UnitTests.Domain.Entities;

public sealed class PermissionTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var id = PermissionId.New();
        var name = new PermissionName("users.read");

        var permission = new Permission(
            id,
            name,
            "Read users");

        Assert.Equal(id, permission.Id);
        Assert.Equal(name, permission.Name);
        Assert.Equal("Read users", permission.Description);
    }

    [Fact]
    public void Rename_Should_Update_Name()
    {
        var permission = new Permission(
            PermissionId.New(),
            new PermissionName("users.read"),
            "Read");

        var newName = new PermissionName("users.write");

        permission.Rename(newName);

        Assert.Equal(newName, permission.Name);
    }

    [Fact]
    public void ChangeDescription_Should_Update_Description()
    {
        var permission = new Permission(
            PermissionId.New(),
            new PermissionName("users.read"),
            "Old");

        permission.ChangeDescription("New");

        Assert.Equal("New", permission.Description);
    }

    [Fact]
    public void ChangeDescription_With_Empty_Should_Throw()
    {
        var permission = new Permission(
            PermissionId.New(),
            new PermissionName("users.read"),
            "Old");

        Assert.Throws<ArgumentException>(() =>
            permission.ChangeDescription(""));
    }
}
