using Microsoft.EntityFrameworkCore;

namespace Astra.SharedKernel.Infrastructure.Persistence;

public abstract class AstraDbContext : DbContext
{
    protected AstraDbContext(
        DbContextOptions options)
        : base(options)
    {
    }

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            GetType().Assembly);

        base.OnModelCreating(modelBuilder);
    }
}