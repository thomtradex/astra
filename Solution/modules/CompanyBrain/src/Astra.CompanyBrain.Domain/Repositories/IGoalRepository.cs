using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Domain.Repositories;

public interface IGoalRepository
{
    Task<Goal?> GetByIdAsync(
        GoalId id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        Goal goal,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        Goal goal,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Goal goal,
        CancellationToken cancellationToken = default);
}