using Astra.Identity.Domain.Authorization.Permissions;
using Astra.Identity.Domain.Authorization.Policies;

namespace Astra.Identity.Application.Authorization.Policies;

public static class PolicyPermissionMap
{
    public static readonly IReadOnlyDictionary<string, string[]> Map =
        new Dictionary<string, string[]>
        {
            {
                MembershipPolicies.CanCreateUser,
                new[]
                {
                    MembershipPermissions.UsersCreate
                }
            },

            {
                MembershipPolicies.CanReadUser,
                new[]
                {
                    MembershipPermissions.UsersRead
                }
            },

            {
                MembershipPolicies.CanUpdateUser,
                new[]
                {
                    MembershipPermissions.UsersUpdate
                }
            },

            {
                MembershipPolicies.CanDeleteUser,
                new[]
                {
                    MembershipPermissions.UsersDelete
                }
            },

            {
                MembershipPolicies.CanAssignRoles,
                new[]
                {
                    MembershipPermissions.RolesAssign
                }
            }
        };
}