using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Domain.Entities;

public sealed class Workspace
{
    public WorkspaceId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Name { get; private set; }

    public string Slug { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private Workspace()
    {
    }

    public Workspace(
        WorkspaceId id,
        OrganizationId organizationId,
        string name,
        string slug,
        DateTime createdAtUtc)
    {
        Id = id;
        OrganizationId = organizationId;
        Name = name;
        Slug = slug;
        CreatedAtUtc = createdAtUtc;
    }

    public void Rename(string name)
    {
        Name = name;
    }

    public void ChangeSlug(string slug)
    {
        Slug = slug;
    }
}