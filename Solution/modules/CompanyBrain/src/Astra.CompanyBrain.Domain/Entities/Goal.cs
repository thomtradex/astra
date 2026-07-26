using Astra.SharedKernel.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Domain.Entities;

public sealed class Goal : Entity<GoalId>
{
    private Goal()
    {
    }

    public Goal(
        GoalId id,
        string title,
        string description)
        : base(id)
    {
        Title = title;
        Description = description;
        CreatedAt = DateTime.UtcNow;
    }

    public string Title { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public bool IsCompleted { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? CompletedAt { get; private set; }

    public void Complete()
    {
        if (IsCompleted)
            return;

        IsCompleted = true;
        CompletedAt = DateTime.UtcNow;
    }

    public void Reopen()
    {
        IsCompleted = false;
        CompletedAt = null;
    }

    public void Update(
        string title,
        string description)
    {
        Title = title;
        Description = description;
    }
}