using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.ValueObjects;

namespace Astra.Knowledge.Domain.Repositories;

public interface IDocumentChunkRepository
{
    Task AddAsync(
        DocumentChunk chunk,
        CancellationToken cancellationToken = default);

    Task<DocumentChunk?> GetByIdAsync(
        DocumentChunkId id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<DocumentChunk>> GetByDocumentIdAsync(
        DocumentId documentId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        DocumentChunkId id,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}