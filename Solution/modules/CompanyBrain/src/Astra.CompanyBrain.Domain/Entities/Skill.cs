using Astra.SharedKernel.Domain.Entities;

namespace Astra.CompanyBrain.Domain.Entities;

public sealed class Skill : Entity<Guid>
{
    private Skill()
    {
    }

    public Skill(
        Guid id,
        string name)
        : base(id)
    {
        Name = name;
    }

    public string Name { get; private set; } = string.Empty;
}