using Astra.Organization.Domain.ValueObjects;
using Astra.Planning.Domain.ValueObjects;

namespace Astra.Planning.Domain.Entities;

public sealed class Plan
{
    public PlanId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Name { get; private set; }

    public string Goal { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private Plan()
    {
        Name = null!;
        Goal = null!;
    }

    public Plan(
        OrganizationId organizationId,
        string name,
        string goal)
    {
        Id = PlanId.New();
        OrganizationId = organizationId;
        Name = name;
        Goal = goal;
        CreatedAtUtc = DateTime.UtcNow;
    }
}