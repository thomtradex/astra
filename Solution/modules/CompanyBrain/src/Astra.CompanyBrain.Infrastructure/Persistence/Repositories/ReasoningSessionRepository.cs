using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.Repositories;
using Astra.CompanyBrain.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;

namespace Astra.CompanyBrain.Infrastructure.Persistence.Repositories;

public sealed class ReasoningSessionRepository : IReasoningSessionRepository
{
    private readonly CompanyBrainDbContext _db;

    public ReasoningSessionRepository(
        CompanyBrainDbContext db)
    {
        _db = db;
    }

    public async Task<ReasoningSession?> GetByIdAsync(
        ReasoningSessionId id,
        CancellationToken cancellationToken = default)
    {
        return await _db.ReasoningSessions.FirstOrDefaultAsync(
            x => x.Id == id,
            cancellationToken);
    }

    public async Task AddAsync(
        ReasoningSession session,
        CancellationToken cancellationToken = default)
    {
        await _db.ReasoningSessions.AddAsync(
            session,
            cancellationToken);
    }

    public Task UpdateAsync(
        ReasoningSession session,
        CancellationToken cancellationToken = default)
    {
        _db.ReasoningSessions.Update(session);

        return Task.CompletedTask;
    }

    public Task DeleteAsync(
        ReasoningSession session,
        CancellationToken cancellationToken = default)
    {
        _db.ReasoningSessions.Remove(session);

        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        await _db.SaveChangesAsync(
            cancellationToken);
    }
}
