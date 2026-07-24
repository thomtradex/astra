using Astra.Organization.Domain.ValueObjects;
using Astra.Planning.Domain.Entities;
using Astra.Planning.Domain.ValueObjects;

namespace Astra.Planning.Domain.Repositories;

public interface IPlanRepository
{
    Task AddAsync(
        Plan plan,
        CancellationToken cancellationToken = default);

    Task<Plan?> GetByIdAsync(
        PlanId id,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<Plan>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}