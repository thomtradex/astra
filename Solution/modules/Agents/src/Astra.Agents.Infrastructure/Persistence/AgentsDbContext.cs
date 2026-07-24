using Astra.Agents.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Astra.Agents.Infrastructure.Persistence;

public sealed class AgentsDbContext : DbContext
{
    public AgentsDbContext(
        DbContextOptions<AgentsDbContext> options)
        : base(options)
    {
    }

    public DbSet<Agent> Agents => Set<Agent>();

    public DbSet<AgentCapability> AgentCapabilities => Set<AgentCapability>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(AgentsDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}