namespace Astra.SharedKernel.Domain.CurrentUser;

public interface ICurrentUser
{
    Guid Id { get; }

    string UserName { get; }

    string Email { get; }

    bool IsAuthenticated { get; }

    IReadOnlyCollection<string> Roles { get; }
}