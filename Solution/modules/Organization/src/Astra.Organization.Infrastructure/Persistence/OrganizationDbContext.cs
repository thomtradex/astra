using Microsoft.EntityFrameworkCore;

namespace Astra.Organization.Infrastructure.Persistence;

public sealed class OrganizationDbContext : DbContext
{
    public OrganizationDbContext(
        DbContextOptions<OrganizationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Astra.Organization.Domain.Entities.Organization> Organizations
        => Set<Astra.Organization.Domain.Entities.Organization>();

    public DbSet<Astra.Organization.Domain.Entities.Workspace> Workspaces
        => Set<Astra.Organization.Domain.Entities.Workspace>();

    public DbSet<Astra.Organization.Domain.Entities.Membership> Memberships
        => Set<Astra.Organization.Domain.Entities.Membership>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrganizationDbContext).Assembly);
    }
}