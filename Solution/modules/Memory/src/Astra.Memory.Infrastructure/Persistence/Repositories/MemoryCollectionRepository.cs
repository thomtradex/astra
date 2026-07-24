using Astra.Memory.Domain.Entities;
using Astra.Memory.Domain.Repositories;
using Astra.Memory.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Memory.Infrastructure.Persistence.Repositories;

public sealed class MemoryCollectionRepository
    : IMemoryCollectionRepository
{
    private readonly MemoryDbContext _db;

    public MemoryCollectionRepository(
        MemoryDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        MemoryCollection collection,
        CancellationToken cancellationToken = default)
    {
        await _db.MemoryCollections.AddAsync(
            collection,
            cancellationToken);
    }

    public async Task<MemoryCollection?> GetByIdAsync(
        MemoryCollectionId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.MemoryCollections
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IEnumerable<MemoryCollection>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _db.MemoryCollections
            .Where(x => x.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        MemoryCollectionId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.MemoryCollections
            .AnyAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(cancellationToken);
    }
}