using Astra.CompanyBrain.Domain.Entities;

namespace Astra.CompanyBrain.Domain.Repositories;

public interface IDecisionRepository
{
    Task<Decision?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Decision decision,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Decision decision,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Decision decision,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}