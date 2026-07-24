using Astra.Organization.Domain.ValueObjects;

namespace Astra.Organization.Domain.Entities;

public sealed class Organization
{
    public OrganizationId Id { get; private set; }

    public string Name { get; private set; }

    public string Slug { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private Organization()
    {
        Id = default;
        Name = string.Empty;
        Slug = string.Empty;
    }

    public Organization(
        string name,
        string slug)
    {
        Id = OrganizationId.New();
        Name = name;
        Slug = slug;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void Update(
        string name,
        string slug)
    {
        Name = name;
        Slug = slug;
    }
}