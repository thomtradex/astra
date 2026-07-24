using Astra.Memory.Domain.Entities;
using Astra.Memory.Domain.ValueObjects;

namespace Astra.Memory.Domain.Repositories;

public interface IMemoryEntryRepository
{
    Task AddAsync(
        MemoryEntry entry,
        CancellationToken cancellationToken = default);

    Task<MemoryEntry?> GetByIdAsync(
        MemoryEntryId id,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<MemoryEntry>> GetByCollectionAsync(
        MemoryCollectionId collectionId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}