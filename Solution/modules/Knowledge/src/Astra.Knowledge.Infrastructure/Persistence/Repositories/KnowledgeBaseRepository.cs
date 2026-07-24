using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.Repositories;
using Astra.Knowledge.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Knowledge.Infrastructure.Persistence.Repositories;

public sealed class KnowledgeBaseRepository
    : IKnowledgeBaseRepository
{
    private readonly KnowledgeDbContext _db;

    public KnowledgeBaseRepository(
        KnowledgeDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        KnowledgeBase knowledgeBase,
        CancellationToken cancellationToken = default)
    {
        await _db.KnowledgeBases.AddAsync(
            knowledgeBase,
            cancellationToken);
    }

    public async Task<KnowledgeBase?> GetByIdAsync(
        KnowledgeBaseId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.KnowledgeBases
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyCollection<KnowledgeBase>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _db.KnowledgeBases
            .Where(x => x.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        KnowledgeBaseId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.KnowledgeBases
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