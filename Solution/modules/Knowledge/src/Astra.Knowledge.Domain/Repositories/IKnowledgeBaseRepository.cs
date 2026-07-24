using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Knowledge.Domain.Repositories;

public interface IKnowledgeBaseRepository
{
    Task AddAsync(
        KnowledgeBase knowledgeBase,
        CancellationToken cancellationToken = default);

    Task<KnowledgeBase?> GetByIdAsync(
        KnowledgeBaseId id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<KnowledgeBase>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        KnowledgeBaseId id,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}