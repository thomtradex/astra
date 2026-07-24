using Astra.Agents.Domain.Entities;
using Astra.Agents.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Agents.Domain.Repositories;

public interface IAgentRepository
{
    Task AddAsync(
        Agent agent,
        CancellationToken cancellationToken = default);

    Task<Agent?> GetByIdAsync(
        AgentId id,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<Agent>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}