using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Application.Abstractions;

public interface IPasswordHasher
{
    PasswordHash Hash(
        string password);

    bool Verify(
        string password,
        PasswordHash passwordHash);
}