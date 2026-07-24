using Astra.Marketplace.Domain.Entities;
using Astra.Marketplace.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Marketplace.Domain.Repositories;

public interface IPluginRepository
{
    Task AddAsync(
        Plugin plugin,
        CancellationToken cancellationToken = default);

    Task<Plugin?> GetByIdAsync(
        PluginId id,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<Plugin>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}