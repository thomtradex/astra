using Astra.Identity.Domain.Entities;

namespace Astra.Identity.Domain.Repositories;

public interface IPermissionRepository
{
    Task<Permission?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<Permission?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Permission permission,
        CancellationToken cancellationToken = default);
}