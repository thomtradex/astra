using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Domain.Repositories;

public interface IUserRoleRepository
{
    Task<bool> ExistsAsync(
        UserId userId,
        RoleId roleId,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        UserRole userRole,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<UserRole>> GetByUserIdAsync(
        UserId userId,
        CancellationToken cancellationToken = default);
}