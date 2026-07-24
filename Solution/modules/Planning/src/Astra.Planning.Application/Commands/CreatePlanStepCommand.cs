namespace Astra.Planning.Application.Commands;

public sealed record CreatePlanStepCommand(
    Guid PlanId,
    string Title,
    string Description,
    int Order);