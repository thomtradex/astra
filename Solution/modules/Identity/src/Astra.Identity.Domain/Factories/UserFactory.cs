using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Domain.Factories;

public static class UserFactory
{
    public static User Create(
        Guid id,
        string email,
        string name,
        PasswordHash passwordHash)
    {
        return new User(
            id,
            email,
            name,
            passwordHash);
    }
}