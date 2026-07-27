using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Domain.Repositories;

public interface IPermissionRepository
{
    Task<Permission?> GetByIdAsync(
        PermissionId id,
        CancellationToken cancellationToken = default);

    Task<Permission?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Permission permission,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Permission permission,
        CancellationToken cancellationToken = default);
}