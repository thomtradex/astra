namespace Astra.Identity.Domain.Authorization.Permissions;

public static class MembershipPermissions
{
    public const string UsersCreate = "users.create";
    public const string UsersRead = "users.read";
    public const string UsersUpdate = "users.update";
    public const string UsersDelete = "users.delete";

    public const string RolesAssign = "roles.assign";

    public const string OrganizationRead = "organization.read";
    public const string OrganizationUpdate = "organization.update";
    public const string OrganizationDelete = "organization.delete";
}