using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.Repositories;
using Astra.Knowledge.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Knowledge.Infrastructure.Persistence.Repositories;

public sealed class DocumentChunkRepository
    : IDocumentChunkRepository
{
    private readonly KnowledgeDbContext _db;

    public DocumentChunkRepository(
        KnowledgeDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        DocumentChunk chunk,
        CancellationToken cancellationToken = default)
    {
        await _db.DocumentChunks.AddAsync(
            chunk,
            cancellationToken);
    }

    public async Task<DocumentChunk?> GetByIdAsync(
        DocumentChunkId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.DocumentChunks
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyCollection<DocumentChunk>> GetByDocumentIdAsync(
        DocumentId documentId,
        CancellationToken cancellationToken = default)
    {
        return await _db.DocumentChunks
            .Where(x => x.DocumentId == documentId)
            .OrderBy(x => x.Index)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        DocumentChunkId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.DocumentChunks
            .AnyAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}