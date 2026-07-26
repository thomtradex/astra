using Astra.SharedKernel.Domain.Entities;
using Astra.CompanyBrain.Domain.ValueObjects;

namespace Astra.CompanyBrain.Domain.Entities;

public sealed class Capability : Entity<CapabilityId>
{
    private Capability()
    {
    }

    public Capability(
        CapabilityId id,
        string name,
        string description)
        : base(id)
    {
        Name = name;
        Description = description;
        CreatedAt = DateTime.UtcNow;
        IsEnabled = true;
    }

    public string Name { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public bool IsEnabled { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public void Enable()
    {
        IsEnabled = true;
    }

    public void Disable()
    {
        IsEnabled = false;
    }

    public void Update(
        string name,
        string description)
    {
        Name = name;
        Description = description;
    }
}