using Astra.Identity.Domain.Enums;
using Astra.Identity.Domain.ValueObjects;
using Astra.SharedKernel.Domain.Entities;

namespace Astra.Identity.Domain.Entities;

public sealed class User : AggregateRoot<Guid>
{
    private User()
    {
    }

    public User(
        Guid id,
        string email,
        string name,
        PasswordHash passwordHash)
    {
        Id = id;

        Email = new Email(email);

        Name = name;

        PasswordHash = passwordHash;

        Status = UserStatus.Active;
    }

    public Email Email { get; private set; } = null!;

    public string Name { get; private set; } = string.Empty;

    public PasswordHash PasswordHash { get; private set; } = null!;

    public UserStatus Status { get; private set; }

    public void ChangePassword(
        PasswordHash passwordHash)
    {
        PasswordHash = passwordHash;
    }

    public void ChangeName(
        string name)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name.Trim();
    }

    public void Suspend()
    {
        Status = UserStatus.Suspended;
    }

    public void Activate()
    {
        Status = UserStatus.Active;
    }

    public void Deactivate()
    {
        Status = UserStatus.Inactive;
    }
}