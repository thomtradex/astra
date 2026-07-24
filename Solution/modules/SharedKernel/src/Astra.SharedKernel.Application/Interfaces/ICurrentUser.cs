namespace Astra.SharedKernel.Application.Interfaces;

public interface ICurrentUser
{
    Guid UserId { get; }

    string Email { get; }

    string Name { get; }

    bool IsAuthenticated { get; }

    IReadOnlyCollection<string> Roles { get; }

    IReadOnlyCollection<string> Permissions { get; }
}