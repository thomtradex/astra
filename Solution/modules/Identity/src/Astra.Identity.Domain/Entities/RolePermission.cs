using Astra.Identity.Domain.Common;
using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Domain.Entities;

public sealed class RolePermission : AggregateRoot<RolePermissionId>
{
    public RoleId RoleId { get; private set; }

    public PermissionId PermissionId { get; private set; }

    private RolePermission()
    {
    }

    public RolePermission(
        RolePermissionId id,
        RoleId roleId,
        PermissionId permissionId)
        : base(id)
    {
        RoleId = roleId;
        PermissionId = permissionId;
    }
}