using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Domain.ValueObjects;
using Astra.CompanyBrain.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Repositories;

public sealed class BrainRepository : IBrainRepository
{
    private readonly CompanyBrainDbContext _db;

    public BrainRepository(
        CompanyBrainDbContext db)
    {
        _db = db;
    }

    public async Task<Brain?> GetByIdAsync(
        BrainId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Brains.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task AddAsync(
        Brain brain,
        CancellationToken cancellationToken = default)
    {
        await _db.Brains.AddAsync(
            brain,
            cancellationToken);
    }

    public Task UpdateAsync(
        Brain brain,
        CancellationToken cancellationToken = default)
    {
        _db.Brains.Update(brain);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        Brain brain,
        CancellationToken cancellationToken = default)
    {
        _db.Brains.Remove(brain);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}