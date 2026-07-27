using Astra.Identity.Domain.Enums;
using Astra.Identity.Domain.ValueObjects;
using Astra.SharedKernel.Domain.Entities;

namespace Astra.Identity.Domain.Entities;

public sealed class Role : AggregateRoot<RoleId>
{
    private readonly List<RolePermission> _permissions = [];

    private Role()
    {
    }

    public Role(
        RoleId id,
        RoleName name,
        RoleType type)
        : base(id)
    {
        Name = name;
        Type = type;
    }

    public RoleName Name { get; private set; } = null!;

    public RoleType Type { get; private set; }

    public IReadOnlyCollection<RolePermission> Permissions
        => _permissions;
}