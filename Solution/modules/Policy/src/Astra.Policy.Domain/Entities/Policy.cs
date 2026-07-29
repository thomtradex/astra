using Astra.Policy.Domain.ValueObjects;

namespace Astra.Policy.Domain.Entities;

public sealed class Policy
{
    public PolicyId Id { get; private set; }

    public string Name { get; private set; }

    public string Description { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private Policy()
    {
        Name = null!;
        Description = null!;
    }

    public Policy(
        string name,
        string description)
    {
        Id = PolicyId.New();
        Name = name;
        Description = description;
        CreatedAtUtc = DateTime.UtcNow;
    }
}
