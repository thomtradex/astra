using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Repositories;

public sealed class GoalRepository : IGoalRepository
{
    private readonly CompanyBrainDbContext _db;

    public GoalRepository(
        CompanyBrainDbContext db)
    {
        _db = db;
    }

    public async Task<Goal?> GetByIdAsync(
        GoalId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.Goals.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task AddAsync(
        Goal goal,
        CancellationToken cancellationToken = default)
    {
        await _db.Goals.AddAsync(
            goal,
            cancellationToken);
    }

    public Task UpdateAsync(
        Goal goal,
        CancellationToken cancellationToken = default)
    {
        _db.Goals.Update(goal);

        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        Goal goal,
        CancellationToken cancellationToken = default)
    {
        _db.Goals.Remove(goal);

        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}
