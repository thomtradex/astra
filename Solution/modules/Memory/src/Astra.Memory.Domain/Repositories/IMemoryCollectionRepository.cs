using Astra.Memory.Domain.Entities;
using Astra.Memory.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Memory.Domain.Repositories;

public interface IMemoryCollectionRepository
{
    Task AddAsync(
        MemoryCollection collection,
        CancellationToken cancellationToken = default);

    Task<MemoryCollection?> GetByIdAsync(
        MemoryCollectionId id,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<MemoryCollection>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        MemoryCollectionId id,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}