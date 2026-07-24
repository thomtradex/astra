using Astra.Marketplace.Domain.Entities;
using Astra.Marketplace.Domain.Repositories;
using Astra.Marketplace.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Marketplace.Infrastructure.Persistence.Repositories;

public sealed class PluginRepository : IPluginRepository
{
    private readonly MarketplaceDbContext _context;

    public PluginRepository(
        MarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(
        Plugin plugin,
        CancellationToken cancellationToken = default)
    {
        await _context.Plugins.AddAsync(plugin, cancellationToken);
    }

    public async Task<Plugin?> GetByIdAsync(
        PluginId id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Plugins.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task<IEnumerable<Plugin>> GetByOrganizationAsync(
        OrganizationId organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Plugins
            .Where(x => x.OrganizationId == organizationId)
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}