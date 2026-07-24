using Astra.Planning.Domain.ValueObjects;

namespace Astra.Planning.Domain.Entities;

public sealed class PlanStep
{
    public PlanStepId Id { get; private set; }

    public PlanId PlanId { get; private set; }

    public string Title { get; private set; }

    public string Description { get; private set; }

    public int Order { get; private set; }

    public bool Completed { get; private set; }

    private PlanStep()
    {
    }

    public PlanStep(
        PlanId planId,
        string title,
        string description,
        int order)
    {
        Id = PlanStepId.New();
        PlanId = planId;
        Title = title;
        Description = description;
        Order = order;
        Completed = false;
    }
}