using Astra.Memory.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Memory.Domain.Entities;

public sealed class MemoryCollection
{
    public MemoryCollectionId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Name { get; private set; }

    public string Description { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private MemoryCollection()
    {
        Name = null!;
        Description = null!;
    }

    public MemoryCollection(
        OrganizationId organizationId,
        string name,
        string description)
    {
        Id = MemoryCollectionId.New();
        OrganizationId = organizationId;
        Name = name;
        Description = description;
        CreatedAtUtc = DateTime.UtcNow;
    }
}