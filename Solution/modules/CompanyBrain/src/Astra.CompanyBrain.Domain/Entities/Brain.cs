using Astra.SharedKernel.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Domain.Entities;

public sealed class Brain : AggregateRoot<BrainId>
{
    private readonly List<Goal> _goals = [];
    private readonly List<Capability> _capabilities = [];
    private readonly List<ReasoningSession> _reasoningSessions = [];

    private Brain()
    {
    }

    public Brain(
        BrainId id,
        string name)
        : base(id)
    {
        Name = name;
        CreatedAt = DateTime.UtcNow;
    }

    public string Name { get; private set; } = string.Empty;

    public DateTime CreatedAt { get; private set; }

    public IReadOnlyCollection<Goal> Goals => _goals;

    public IReadOnlyCollection<Capability> Capabilities => _capabilities;

    public IReadOnlyCollection<ReasoningSession> ReasoningSessions
        => _reasoningSessions;

    public void AddGoal(Goal goal)
    {
        _goals.Add(goal);
    }

    public void AddCapability(Capability capability)
    {
        _capabilities.Add(capability);
    }

    public void AddReasoningSession(
        ReasoningSession session)
    {
        _reasoningSessions.Add(session);
    }
}