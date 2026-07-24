using Astra.Agents.Domain.ValueObjects;

namespace Astra.Agents.Domain.Entities;

public sealed class AgentCapability
{
    public AgentCapabilityId Id { get; private set; }

    public AgentId AgentId { get; private set; }

    public string Name { get; private set; }

    public string Description { get; private set; }

    private AgentCapability()
    {
    }

    public AgentCapability(
        AgentId agentId,
        string name,
        string description)
    {
        Id = AgentCapabilityId.New();
        AgentId = agentId;
        Name = name;
        Description = description;
    }
}