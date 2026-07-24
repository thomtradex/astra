using Astra.Memory.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Astra.Memory.Infrastructure.Persistence;

public sealed class MemoryDbContext : DbContext
{
    public MemoryDbContext(
        DbContextOptions<MemoryDbContext> options)
        : base(options)
    {
    }

    public DbSet<MemoryCollection> MemoryCollections => Set<MemoryCollection>();

    public DbSet<MemoryEntry> MemoryEntries => Set<MemoryEntry>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(MemoryDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}