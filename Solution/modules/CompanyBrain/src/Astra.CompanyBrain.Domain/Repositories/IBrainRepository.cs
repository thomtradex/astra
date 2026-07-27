using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Domain.Repositories;

public interface IBrainRepository
{
    Task<Brain?> GetByIdAsync(
        BrainId id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Brain brain,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Brain brain,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Brain brain,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}