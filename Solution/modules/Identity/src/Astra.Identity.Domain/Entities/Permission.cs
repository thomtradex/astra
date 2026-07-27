using Astra.Identity.Domain.ValueObjects;
using Astra.SharedKernel.Domain.Entities;

namespace Astra.Identity.Domain.Entities;

public sealed class Permission : AggregateRoot<PermissionId>
{
    private Permission()
    {
    }

    public Permission(
        PermissionId id,
        PermissionName name,
        string description)
        : base(id)
    {
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