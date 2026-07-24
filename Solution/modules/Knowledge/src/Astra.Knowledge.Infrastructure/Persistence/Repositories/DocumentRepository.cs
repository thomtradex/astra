using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.Repositories;
using Astra.Knowledge.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Knowledge.Infrastructure.Persistence.Repositories;

public sealed class DocumentRepository
    : IDocumentRepository
{
    private readonly KnowledgeDbContext _db;

    public DocumentRepository(
        KnowledgeDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        Document document,
        CancellationToken cancellationToken = default)
    {
        await _db.Documents.AddAsync(
            document,
            cancellationToken);
    }

    public async Task<Document?> GetByIdAsync(
        DocumentId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Documents
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyCollection<Document>> GetByKnowledgeBaseIdAsync(
        KnowledgeBaseId knowledgeBaseId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Documents
            .Where(x => x.KnowledgeBaseId == knowledgeBaseId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        DocumentId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Documents
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