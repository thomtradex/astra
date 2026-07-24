namespace Astra.Identity.Domain.Exceptions;

public sealed class UserNotFoundException : Exception
{
    public UserNotFoundException()
        : base("User not found.")
    {
    }
}