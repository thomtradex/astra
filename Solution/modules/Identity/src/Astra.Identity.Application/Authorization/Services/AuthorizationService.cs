using Astra.Identity.Application.Authorization.Interfaces;
using Astra.Identity.Application.Authorization.Requirements;
using Astra.Identity.Application.Interfaces;

namespace Astra.Identity.Application.Authorization.Services;

public sealed class AuthorizationService : IAuthorizationService
{
    private readonly IPermissionResolver _permissionResolver;
    private readonly PolicyEvaluator _policyEvaluator;

    public AuthorizationService(
        IPermissionResolver permissionResolver,
        PolicyEvaluator policyEvaluator)
    {
        _permissionResolver = permissionResolver;
        _policyEvaluator = policyEvaluator;
    }

    public async Task<bool> AuthorizeAsync(
        Guid userId,
        Guid organizationId,
        string policy,
        CancellationToken cancellationToken = default)
    {
        // Temporário.
        // Na próxima fase deixaremos de usar apenas UserId.
        var permissions = await _permissionResolver.ResolveAsync(
            new Astra.Identity.Domain.ValueObjects.UserId(userId),
            cancellationToken);

        return _policyEvaluator.Evaluate(
            permissions,
            policy);
    }
}