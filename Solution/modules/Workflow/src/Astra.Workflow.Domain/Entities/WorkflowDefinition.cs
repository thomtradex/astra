using Astra.Organization.Domain.ValueObjects;
using Astra.Workflow.Domain.ValueObjects;

namespace Astra.Workflow.Domain.Entities;

public sealed class WorkflowDefinition
{
    public WorkflowId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Name { get; private set; }

    public string Description { get; private set; }

    public bool Enabled { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private WorkflowDefinition()
    {
    }

    public WorkflowDefinition(
        OrganizationId organizationId,
        string name,
        string description)
    {
        Id = WorkflowId.New();
        OrganizationId = organizationId;
        Name = name;
        Description = description;
        Enabled = true;
        CreatedAtUtc = DateTime.UtcNow;
    }
}