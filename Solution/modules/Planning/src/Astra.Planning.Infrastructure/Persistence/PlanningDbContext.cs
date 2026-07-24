using Astra.Planning.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Astra.Planning.Infrastructure.Persistence;

public sealed class PlanningDbContext : DbContext
{
    public PlanningDbContext(
        DbContextOptions<PlanningDbContext> options)
        : base(options)
    {
    }

    public DbSet<Plan> Plans => Set<Plan>();

    public DbSet<PlanStep> PlanSteps => Set<PlanStep>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(PlanningDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}