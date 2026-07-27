using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Repositories;

public sealed class DecisionRepository : IDecisionRepository
{
    private readonly CompanyBrainDbContext _db;

    public DecisionRepository(
        CompanyBrainDbContext db)
    {
        _db = db;
    }

    public async Task<Decision?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Decisions.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task AddAsync(
        Decision decision,
        CancellationToken cancellationToken = default)
    {
        await _db.Decisions.AddAsync(
            decision,
            cancellationToken);
    }

    public Task UpdateAsync(
        Decision decision,
        CancellationToken cancellationToken = default)
    {
        _db.Decisions.Update(decision);

        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        Decision decision,
        CancellationToken cancellationToken = default)
    {
        _db.Decisions.Remove(decision);

        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}