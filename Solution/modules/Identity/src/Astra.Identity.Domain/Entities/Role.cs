using Astra.Identity.Domain.ValueObjects;
using Astra.SharedKernel.Domain.Entities;

namespace Astra.Identity.Domain.Entities;

public sealed class Role : AggregateRoot<Guid>
{
    private readonly HashSet<Guid> _permissions = [];

    private Role()
    {
    }

    public Role(
        Guid id,
        RoleName name)
    {
        Id = id;

        Name = name;
    }

    public RoleName Name { get; private set; } = null!;

    public IReadOnlyCollection<Guid> Permissions
        => _permissions;

    public void Rename(
        RoleName name)
    {
        Name = name;
    }

    public void AddPermission(
        Guid permissionId)
    {
        _permissions.Add(permissionId);
    }

    public void RemovePermission(
        Guid permissionId)
    {
        _permissions.Remove(permissionId);
    }
}