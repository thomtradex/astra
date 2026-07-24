using Astra.Agents.Domain.Entities;
using Astra.Agents.Domain.Repositories;
using Astra.Agents.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Agents.Infrastructure.Persistence.Repositories;

public sealed class AgentRepository : IAgentRepository
{
    private readonly AgentsDbContext _context;

    public AgentRepository(AgentsDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        Agent agent,
        CancellationToken cancellationToken = default)
    {
        await _context.Agents.AddAsync(agent, cancellationToken);
    }

    public async Task<Agent?> GetByIdAsync(
        AgentId id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Agents.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task<IEnumerable<Agent>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Agents
            .Where(x => x.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}