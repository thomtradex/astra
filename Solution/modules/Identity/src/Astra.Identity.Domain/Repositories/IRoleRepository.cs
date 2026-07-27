using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Domain.Repositories;

public interface IRoleRepository
{
    Task<Role?> GetByIdAsync(
        RoleId id,
        CancellationToken cancellationToken = default);

    Task<Role?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Role role,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Role role,
        CancellationToken cancellationToken = default);
}