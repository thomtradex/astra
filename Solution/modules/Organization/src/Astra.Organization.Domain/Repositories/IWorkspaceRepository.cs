using Astra.Organization.Domain.Entities;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Domain.Repositories;

public interface IWorkspaceRepository
{
    Task AddAsync(
        Workspace workspace,
        CancellationToken cancellationToken = default);

    Task<Workspace?> GetByIdAsync(
        WorkspaceId id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Workspace>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        WorkspaceId id,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}