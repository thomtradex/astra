using Astra.Identity.Domain.ValueObjects;
using Astra.SharedKernel.Domain.Entities;

namespace Astra.Identity.Domain.Entities;

public sealed class Permission : AggregateRoot<Guid>
{
    private Permission()
    {
    }

    public Permission(
        Guid id,
        PermissionName name,
        string description)
    {
        Id = id;

        Name = name;

        Description = description;
    }

    public PermissionName Name { get; private set; } = null!;

    public string Description { get; private set; } = string.Empty;

    public void Rename(
        PermissionName name)
    {
        Name = name;
    }

    public void ChangeDescription(
        string description)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);

        Description = description.Trim();
    }
}