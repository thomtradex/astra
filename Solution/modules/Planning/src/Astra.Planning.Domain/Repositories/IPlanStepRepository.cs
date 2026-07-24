using Astra.Planning.Domain.Entities;
using Astra.Planning.Domain.ValueObjects;

namespace Astra.Planning.Domain.Repositories;

public interface IPlanStepRepository
{
    Task AddAsync(
        PlanStep step,
        CancellationToken cancellationToken = default);

    Task<PlanStep?> GetByIdAsync(
        PlanStepId id,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<PlanStep>> GetByPlanAsync(
        PlanId planId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}