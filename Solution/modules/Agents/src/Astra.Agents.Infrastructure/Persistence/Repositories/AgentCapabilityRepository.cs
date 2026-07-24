using Astra.Agents.Domain.Entities;
using Astra.Agents.Domain.Repositories;
using Astra.Agents.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Agents.Infrastructure.Persistence.Repositories;

public sealed class AgentCapabilityRepository : IAgentCapabilityRepository
{
    private readonly AgentsDbContext _context;

    public AgentCapabilityRepository(AgentsDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        AgentCapability capability,
        CancellationToken cancellationToken = default)
    {
        await _context.AgentCapabilities.AddAsync(capability, cancellationToken);
    }

    public async Task<AgentCapability?> GetByIdAsync(
        AgentCapabilityId id,
        CancellationToken cancellationToken = default)
    {
        return await _context.AgentCapabilities.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task<IEnumerable<AgentCapability>> GetByAgentAsync(
        AgentId agentId,
        CancellationToken cancellationToken = default)
    {
        return await _context.AgentCapabilities
            .Where(x => x.AgentId == agentId)
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}