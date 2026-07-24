using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Domain.Repositories;

public interface IRolePermissionRepository
{
    Task<bool> ExistsAsync(
        RoleId roleId,
        PermissionId permissionId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        RolePermission rolePermission,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<RolePermission>> GetByRoleIdsAsync(
        IReadOnlyCollection<RoleId> roleIds,
        CancellationToken cancellationToken = default);
}