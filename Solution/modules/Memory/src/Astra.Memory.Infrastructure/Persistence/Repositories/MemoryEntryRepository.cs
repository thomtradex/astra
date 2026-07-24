using Astra.Memory.Domain.Entities;
using Astra.Memory.Domain.Repositories;
using Astra.Memory.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Memory.Infrastructure.Persistence.Repositories;

public sealed class MemoryEntryRepository
    : IMemoryEntryRepository
{
    private readonly MemoryDbContext _db;

    public MemoryEntryRepository(
        MemoryDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        MemoryEntry entry,
        CancellationToken cancellationToken = default)
    {
        await _db.MemoryEntries.AddAsync(
            entry,
            cancellationToken);
    }

    public async Task<MemoryEntry?> GetByIdAsync(
        MemoryEntryId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.MemoryEntries
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IEnumerable<MemoryEntry>> GetByCollectionAsync(
        MemoryCollectionId collectionId,
        CancellationToken cancellationToken = default)
    {
        return await _db.MemoryEntries
            .Where(x => x.MemoryCollectionId == collectionId)
            .ToListAsync(cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(cancellationToken);
    }
}