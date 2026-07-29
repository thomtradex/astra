using Astra.Projects.Domain.Entities;
using Astra.Projects.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Projects.Domain.Repositories;

public interface IProjectRepository
{
    Task AddAsync(
        Project project,
        CancellationToken cancellationToken = default);

    Task<Project?> GetByIdAsync(
        ProjectId id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Project>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        ProjectId id,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}