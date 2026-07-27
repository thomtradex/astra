using Astra.CompanyBrain.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Astra.CompanyBrain.Infrastructure.Persistence;

public sealed class CompanyBrainDbContext : DbContext
{
    public CompanyBrainDbContext(
        DbContextOptions<CompanyBrainDbContext> options)
        : base(options)
    {
    }

    public DbSet<Brain> Brains => Set<Brain>();

    public DbSet<Goal> Goals => Set<Goal>();

    public DbSet<Capability> Capabilities => Set<Capability>();

    public DbSet<ReasoningSession> ReasoningSessions => Set<ReasoningSession>();

    public DbSet<Decision> Decisions => Set<Decision>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(CompanyBrainDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
