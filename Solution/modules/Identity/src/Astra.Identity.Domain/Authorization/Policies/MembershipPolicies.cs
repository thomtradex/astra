namespace Astra.Identity.Domain.Authorization.Policies;

public static class MembershipPolicies
{
    public const string CanCreateUser = nameof(CanCreateUser);
    public const string CanReadUser = nameof(CanReadUser);
    public const string CanUpdateUser = nameof(CanUpdateUser);
    public const string CanDeleteUser = nameof(CanDeleteUser);

    public const string CanAssignRoles = nameof(CanAssignRoles);

    public const string CanReadOrganization = nameof(CanReadOrganization);
    public const string CanUpdateOrganization = nameof(CanUpdateOrganization);
    public const string CanDeleteOrganization = nameof(CanDeleteOrganization);
}