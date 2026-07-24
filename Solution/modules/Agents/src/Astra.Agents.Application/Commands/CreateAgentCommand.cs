namespace Astra.Agents.Application.Commands;

public sealed record CreateAgentCommand(
    Guid OrganizationId,
    string Name,
    string Description);