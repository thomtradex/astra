using Astra.Organization.Domain.Entities;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Domain.Repositories;

public interface IMembershipRepository
{
    Task AddAsync(
        Membership membership,
        CancellationToken cancellationToken = default);

    Task<Membership?> GetByIdAsync(
        MembershipId id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Membership>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Membership>> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<Membership?> GetAsync(
        OrganizationId organizationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        OrganizationId organizationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}