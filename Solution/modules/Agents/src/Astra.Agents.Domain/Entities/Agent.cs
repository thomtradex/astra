using Astra.Agents.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Agents.Domain.Entities;

public sealed class Agent
{
    public AgentId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Name { get; private set; }

    public string Description { get; private set; }

    public bool Enabled { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private Agent()
    {
    }

    public Agent(
        OrganizationId organizationId,
        string name,
        string description)
    {
        Id = AgentId.New();
        OrganizationId = organizationId;
        Name = name;
        Description = description;
        Enabled = true;
        CreatedAtUtc = DateTime.UtcNow;
    }
}