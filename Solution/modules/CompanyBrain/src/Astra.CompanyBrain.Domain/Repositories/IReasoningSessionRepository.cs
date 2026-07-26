using Astra.CompanyBrain.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Domain.Repositories;

public interface IReasoningSessionRepository
{
    Task<ReasoningSession?> GetByIdAsync(
        ReasoningSessionId id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        ReasoningSession session,
        CancellationToken cancellationToken = default);

    Task UpdateAsync(
        ReasoningSession session,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        ReasoningSession session,
        CancellationToken cancellationToken = default);
}