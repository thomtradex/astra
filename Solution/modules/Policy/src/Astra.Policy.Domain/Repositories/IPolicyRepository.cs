using Astra.Policy.Domain.ValueObjects;
using PolicyEntity = Astra.Policy.Domain.Entities.Policy;

namespace Astra.Policy.Domain.Repositories;

public interface IPolicyRepository
{
    Task AddAsync(
        PolicyEntity policy,
        CancellationToken cancellationToken = default);

    Task<PolicyEntity?> GetByIdAsync(
        PolicyId id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<PolicyEntity>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        PolicyId id,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}