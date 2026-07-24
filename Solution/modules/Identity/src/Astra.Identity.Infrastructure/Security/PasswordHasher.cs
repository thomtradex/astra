using Astra.Identity.Application.Abstractions;
using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Infrastructure.Security;

public sealed class PasswordHasher : IPasswordHasher
{
    public PasswordHash Hash(
        string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        var hash = BCrypt.Net.BCrypt.HashPassword(password);

        return new PasswordHash(hash);
    }

    public bool Verify(
        string password,
        PasswordHash passwordHash)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        ArgumentNullException.ThrowIfNull(passwordHash);

        return BCrypt.Net.BCrypt.Verify(
            password,
            passwordHash.Value);
    }
}