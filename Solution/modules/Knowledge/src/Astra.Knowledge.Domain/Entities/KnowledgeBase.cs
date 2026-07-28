using Astra.Knowledge.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Knowledge.Domain.Entities;

public sealed class KnowledgeBase
{
    public KnowledgeBaseId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Name { get; private set; }

    public string Description { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private KnowledgeBase()
    {
        Name = null!;
        Description = null!;
    }

    public KnowledgeBase(
        KnowledgeBaseId id,
        OrganizationId organizationId,
        string name,
        string description,
        DateTime createdAtUtc)
    {
        Id = id;
        OrganizationId = organizationId;
        Name = name;
        Description = description;
        CreatedAtUtc = createdAtUtc;
    }

    public void Rename(string name)
    {
        Name = name;
    }

    public void ChangeDescription(string description)
    {
        Description = description;
    }
}