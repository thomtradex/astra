using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Repositories;

public sealed class CapabilityRepository : ICapabilityRepository
{
    private readonly CompanyBrainDbContext _db;

    public CapabilityRepository(
        CompanyBrainDbContext db)
    {
        _db = db;
    }

    public async Task<Capability?> GetByIdAsync(
        CapabilityId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Capabilities.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task AddAsync(
        Capability capability,
        CancellationToken cancellationToken = default)
    {
        await _db.Capabilities.AddAsync(
            capability,
            cancellationToken);
    }

    public Task UpdateAsync(
        Capability capability,
        CancellationToken cancellationToken = default)
    {
        _db.Capabilities.Update(capability);

        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        Capability capability,
        CancellationToken cancellationToken = default)
    {
        _db.Capabilities.Remove(capability);

        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}
