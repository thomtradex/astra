namespace Astra.Planning.Application.Commands;

public sealed record CreatePlanCommand(
    Guid OrganizationId,
    string Name,
    string Goal);