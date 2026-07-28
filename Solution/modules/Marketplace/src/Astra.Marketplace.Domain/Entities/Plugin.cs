using Astra.Marketplace.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Marketplace.Domain.Entities;

public sealed class Plugin
{
    public PluginId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Name { get; private set; }

    public string Version { get; private set; }

    public string Description { get; private set; }

    public bool Enabled { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private Plugin()
    {
        Name = null!;
        Version = null!;
        Description = null!;
    }

    public Plugin(
        OrganizationId organizationId,
        string name,
        string version,
        string description)
    {
        Id = PluginId.New();
        OrganizationId = organizationId;
        Name = name;
        Version = version;
        Description = description;
        Enabled = true;
        CreatedAtUtc = DateTime.UtcNow;
    }
}