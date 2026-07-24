using Astra.Organization.Domain.Entities;
using Astra.Organization.Domain.Repositories;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Organization.Infrastructure.Persistence.Repositories;

public sealed class MembershipRepository
    : IMembershipRepository
{
    private readonly OrganizationDbContext _db;

    public MembershipRepository(
        OrganizationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        Membership membership,
        CancellationToken cancellationToken = default)
    {
        await _db.Memberships.AddAsync(
            membership,
            cancellationToken);
    }

    public async Task<Membership?> GetByIdAsync(
        MembershipId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Memberships
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyCollection<Membership>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Memberships
            .Where(x => x.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Membership>> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Memberships
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Membership?> GetAsync(
        OrganizationId organizationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Memberships
            .FirstOrDefaultAsync(
                x => x.OrganizationId == organizationId &&
                     x.UserId == userId,
                cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        OrganizationId organizationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Memberships
            .AnyAsync(
                x => x.OrganizationId == organizationId &&
                     x.UserId == userId,
                cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}