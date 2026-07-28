using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Identity.Domain.Repositories;

public interface IMembershipRepository
{
    Task AddAsync(
        Membership membership,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Membership>> GetByUserIdAsync(
        UserId userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Membership>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);
}