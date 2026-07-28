using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.Enums;
using Astra.Identity.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Xunit;

namespace Astra.Identity.UnitTests.Domain.Entities;

public sealed class UserTests
{
    [Fact]
    public void Constructor_ShouldInitializeProperties()
    {
        var id = UserId.New();
        var email = new Email("john@test.com");
        var password = new PasswordHash("HASH");

        var user = new User(
            id,
            email,
            "John",
            password);

        Assert.Equal(id, user.Id);
        Assert.Equal(email, user.Email);
        Assert.Equal("John", user.Name);
        Assert.Equal(password, user.PasswordHash);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.Empty(user.RefreshTokens);
        Assert.Empty(user.Memberships);
    }

    [Fact]
    public void UpdateProfile_ShouldUpdateNameAndEmail()
    {
        var user = new User(
            UserId.New(),
            new Email("old@test.com"),
            "Old",
            new PasswordHash("HASH"));

        var email = new Email("new@test.com");

        user.UpdateProfile(
            "New Name",
            email);

        Assert.Equal("New Name", user.Name);
        Assert.Equal(email, user.Email);
    }

    [Fact]
    public void ChangePassword_ShouldReplacePassword()
    {
        var user = new User(
            UserId.New(),
            new Email("john@test.com"),
            "John",
            new PasswordHash("OLD"));

        var password = new PasswordHash("NEW");

        user.ChangePassword(password);

        Assert.Equal(password, user.PasswordHash);
    }

    [Fact]
    public void ChangeStatus_ShouldUpdateStatus()
    {
        var user = new User(
            UserId.New(),
            new Email("john@test.com"),
            "John",
            new PasswordHash("HASH"));

        user.ChangeStatus(UserStatus.Inactive);

        Assert.Equal(UserStatus.Inactive, user.Status);
    }

    [Fact]
    public void AddRefreshToken_ShouldStoreToken()
    {
        var user = new User(
            UserId.New(),
            new Email("john@test.com"),
            "John",
            new PasswordHash("HASH"));

        var token = new RefreshToken(
            RefreshTokenId.New(),
            user.Id,
            "TOKEN",
            DateTime.UtcNow.AddDays(7));

        user.AddRefreshToken(token);

        Assert.Single(user.RefreshTokens);
        Assert.Contains(token, user.RefreshTokens);
    }

    [Fact]
    public void AddMembership_ShouldStoreMembership()
    {
        var user = new User(
            UserId.New(),
            new Email("john@test.com"),
            "John",
            new PasswordHash("HASH"));

        var membership = new Membership(
            Astra.Identity.Domain.ValueObjects.MembershipId.New(),
            user.Id,
            OrganizationId.New(),
            RoleId.New());

        user.AddMembership(membership);

        Assert.Single(user.Memberships);
        Assert.Contains(membership, user.Memberships);
    }
}