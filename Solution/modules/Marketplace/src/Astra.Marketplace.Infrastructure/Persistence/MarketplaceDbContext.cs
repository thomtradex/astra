using Astra.Marketplace.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Astra.Marketplace.Infrastructure.Persistence;

public sealed class MarketplaceDbContext : DbContext
{
    public MarketplaceDbContext(
        DbContextOptions<MarketplaceDbContext> options)
        : base(options)
    {
    }

    public DbSet<Plugin> Plugins => Set<Plugin>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MarketplaceDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}