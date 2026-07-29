using Astra.Organization.Domain.ValueObjects;
using Astra.Projects.Domain.ValueObjects;

namespace Astra.Projects.Domain.Entities;

public sealed class Project
{
    public ProjectId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Name { get; private set; }

    public string Description { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private Project()
    {
        Name = null!;
        Description = null!;
    }

    public Project(
        OrganizationId organizationId,
        string name,
        string description)
    {
        Id = ProjectId.New();
        OrganizationId = organizationId;
        Name = name;
        Description = description;
        CreatedAtUtc = DateTime.UtcNow;
    }
}