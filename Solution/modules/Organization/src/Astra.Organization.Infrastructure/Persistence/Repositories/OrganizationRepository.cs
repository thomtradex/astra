using Astra.Organization.Domain.Repositories;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Organization.Infrastructure.Persistence.Repositories;

public sealed class OrganizationRepository
    : IOrganizationRepository
{
    private readonly OrganizationDbContext _db;

    public OrganizationRepository(
        OrganizationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        Astra.Organization.Domain.Entities.Organization organization,
        CancellationToken cancellationToken = default)
    {
        await _db.Organizations.AddAsync(
            organization,
            cancellationToken);
    }

    public Task DeleteAsync(
        Astra.Organization.Domain.Entities.Organization organization,
        CancellationToken cancellationToken)
    {
        _db.Organizations.Remove(organization);
        return Task.CompletedTask;
    }

    public async Task<Astra.Organization.Domain.Entities.Organization?> GetByIdAsync(
        OrganizationId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Organizations
            .FirstOrDefaultAsync(
                x => x.Id.Value == id.Value,
                cancellationToken);
    }

    public async Task<Astra.Organization.Domain.Entities.Organization?> GetBySlugAsync(
        string slug,
        CancellationToken cancellationToken = default)
    {
        return await _db.Organizations
            .FirstOrDefaultAsync(
                x => x.Slug == slug,
                cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        OrganizationId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Organizations
            .AnyAsync(
                x => x.Id.Value == id.Value,
                cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}