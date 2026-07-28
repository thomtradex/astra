using Astra.Identity.Application.Authorization.Policies;

namespace Astra.Identity.Application.Authorization.Services;

public sealed class PolicyEvaluator
{
    public bool Evaluate(
        IEnumerable<string> permissions,
        string policy)
    {
        if (!PolicyPermissionMap.Map.TryGetValue(policy, out var requiredPermissions))
            return false;

        return requiredPermissions.All(permissions.Contains);
    }
}