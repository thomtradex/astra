using Astra.Identity.Domain.Entities;
using Astra.Identity.Domain.Repositories;
using Astra.Identity.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.Identity.Infrastructure.Persistence.Repositories;

public sealed class RoleRepository : IRoleRepository
{
    private readonly IdentityDbContext _context;

    public RoleRepository(
        IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<Role?> GetByIdAsync(
        RoleId id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public async Task<Role?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default)
    {
        return await _context.Roles
            .FirstOrDefaultAsync(
                x => x.Name == name,
                cancellationToken);
    }

    public async Task AddAsync(
        Role role,
        CancellationToken cancellationToken = default)
    {
        await _context.Roles.AddAsync(
            role,
            cancellationToken);
    }

    public Task UpdateAsync(
        Role role,
        CancellationToken cancellationToken = default)
    {
        _context.Roles.Update(role);

        return Task.CompletedTask;
    }
}