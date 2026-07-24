using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.ValueObjects;

namespace Astra.Knowledge.Domain.Repositories;

public interface IDocumentRepository
{
    Task AddAsync(
        Document document,
        CancellationToken cancellationToken = default);

    Task<Document?> GetByIdAsync(
        DocumentId id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Document>> GetByKnowledgeBaseIdAsync(
        KnowledgeBaseId knowledgeBaseId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        DocumentId id,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}