using Astra.Identity.Domain.Enums;
using Astra.Identity.Domain.ValueObjects;
using Astra.SharedKernel.Domain.Entities;

namespace Astra.Identity.Domain.Entities;

public sealed class User : AggregateRoot<UserId>
{
    private readonly List<RefreshToken> _refreshTokens = [];

    private readonly List<UserRole> _userRoles = [];

    private User()
    {
    }

    public User(
        UserId id,
        Email email,
        string name,
        PasswordHash passwordHash)
        : base(id)
    {
        Email = email;
        Name = name;
        PasswordHash = passwordHash;
        Status = UserStatus.Active;
    }

    public Email Email { get; private set; } = null!;

    public string Name { get; private set; } = null!;

    public PasswordHash PasswordHash { get; private set; } = null!;

    public UserStatus Status { get; private set; }

    public IReadOnlyCollection<RefreshToken> RefreshTokens
        => _refreshTokens;

    public IReadOnlyCollection<UserRole> UserRoles
        => _userRoles;

    public void UpdateProfile(
        string name,
        Email email)
    {
        Name = name;
        Email = email;
    }

    public void ChangePassword(
        PasswordHash passwordHash)
    {
        PasswordHash = passwordHash;
    }

    public void AddRefreshToken(
        RefreshToken refreshToken)
    {
        _refreshTokens.Add(refreshToken);
    }

    public void AddRole(
        UserRole userRole)
    {
        _userRoles.Add(userRole);
    }

    public void ChangeStatus(
        UserStatus status)
    {
        Status = status;
    }
}