using Astra.Agents.Domain.Entities;
using Astra.Agents.Domain.ValueObjects;

namespace Astra.Agents.Domain.Repositories;

public interface IAgentCapabilityRepository
{
    Task AddAsync(
        AgentCapability capability,
        CancellationToken cancellationToken = default);

    Task<AgentCapability?> GetByIdAsync(
        AgentCapabilityId id,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<AgentCapability>> GetByAgentAsync(
        AgentId agentId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}