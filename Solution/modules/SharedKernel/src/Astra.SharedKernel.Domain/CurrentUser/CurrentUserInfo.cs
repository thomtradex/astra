namespace Astra.SharedKernel.Domain.CurrentUser;

public sealed record CurrentUserInfo(
    Guid Id,
    string UserName,
    string Email,
    bool IsAuthenticated,
    IReadOnlyCollection<string> Roles);