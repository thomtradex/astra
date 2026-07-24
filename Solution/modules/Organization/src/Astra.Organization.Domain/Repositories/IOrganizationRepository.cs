using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Domain.Repositories;

public interface IOrganizationRepository
{
    Task AddAsync(
        Astra.Organization.Domain.Entities.Organization organization,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        Astra.Organization.Domain.Entities.Organization organization,
        CancellationToken cancellationToken);

    Task<Astra.Organization.Domain.Entities.Organization?> GetByIdAsync(
        OrganizationId id,
        CancellationToken cancellationToken);

    Task<Astra.Organization.Domain.Entities.Organization?> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken);

    Task<bool> ExistsAsync(
        OrganizationId id,
        CancellationToken cancellationToken);

    Task SaveChangesAsync(
        CancellationToken cancellationToken);
}