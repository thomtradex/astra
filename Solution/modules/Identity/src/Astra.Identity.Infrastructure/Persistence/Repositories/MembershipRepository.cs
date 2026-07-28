using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.Repositories;
using Astra.Identity.Domain.ValueObjects;
using Astra.Identity.Infrastructure.Persistence;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Identity.Infrastructure.Persistence.Repositories;

public sealed class MembershipRepository : IMembershipRepository
{
    private readonly IdentityDbContext _context;

    public MembershipRepository(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        Membership membership,
        CancellationToken cancellationToken = default)
    {
        await _context.Set<Membership>()
            .AddAsync(membership, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Membership>> GetByUserIdAsync(
        UserId userId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Set<Membership>()
            .Where(x => x.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Membership>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Set<Membership>()
            .Where(x => x.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
    }
}