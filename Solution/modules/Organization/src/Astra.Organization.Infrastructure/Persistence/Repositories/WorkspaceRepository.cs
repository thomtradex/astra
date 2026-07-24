using Astra.Organization.Domain.Entities;
using Astra.Organization.Domain.Repositories;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Organization.Infrastructure.Persistence.Repositories;

public sealed class WorkspaceRepository
    : IWorkspaceRepository
{
    private readonly OrganizationDbContext _db;

    public WorkspaceRepository(
        OrganizationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(
        Workspace workspace,
        CancellationToken cancellationToken = default)
    {
        await _db.Workspaces.AddAsync(
            workspace,
            cancellationToken);
    }

    public async Task<Workspace?> GetByIdAsync(
        WorkspaceId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Workspaces
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<IReadOnlyCollection<Workspace>> GetByOrganizationIdAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Workspaces
            .Where(x => x.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        WorkspaceId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Workspaces
            .AnyAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}