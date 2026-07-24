namespace Astra.Agents.Application.Commands;

public sealed record CreateAgentCapabilityCommand(
    Guid AgentId,
    string Name,
    string Description);