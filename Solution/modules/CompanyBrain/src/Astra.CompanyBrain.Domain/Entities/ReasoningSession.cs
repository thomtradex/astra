using Astra.SharedKernel.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Domain.Entities;

public sealed class ReasoningSession : Entity<ReasoningSessionId>
{
    private readonly List<Decision> _decisions = [];

    private ReasoningSession()
    {
    }

    public ReasoningSession(
        ReasoningSessionId id,
        string title)
        : base(id)
    {
        Title = title;
        StartedAt = DateTime.UtcNow;
    }

    public string Title { get; private set; } = string.Empty;

    public DateTime StartedAt { get; private set; }

    public DateTime? FinishedAt { get; private set; }

    public bool IsCompleted => FinishedAt.HasValue;

    public IReadOnlyCollection<Decision> Decisions => _decisions;

    public void AddDecision(
        Decision decision)
    {
        _decisions.Add(decision);
    }

    public void Complete()
    {
        if (FinishedAt is not null)
            return;

        FinishedAt = DateTime.UtcNow;
    }
}