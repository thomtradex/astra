namespace Astra.Identity.Application.Authorization.Interfaces;

public interface IAuthorizationService
{
    Task<bool> AuthorizeAsync(
        Guid userId,
        Guid organizationId,
        string policy,
        CancellationToken cancellationToken = default);
}