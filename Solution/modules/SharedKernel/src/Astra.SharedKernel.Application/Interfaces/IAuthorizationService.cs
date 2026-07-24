namespace Astra.SharedKernel.Application.Interfaces;

public interface IAuthorizationService
{
    Task<IAuthorizationResult> AuthorizeAsync(
        ICurrentUser user,
        IAuthorizationRequirement requirement,
        CancellationToken cancellationToken = default);
}