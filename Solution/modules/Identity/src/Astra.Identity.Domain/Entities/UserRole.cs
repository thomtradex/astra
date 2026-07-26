using Astra.SharedKernel.Domain.Entities;
using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Domain.Entities;

public sealed class UserRole : AggregateRoot<UserRoleId>
{
    public UserId UserId { get; private set; }

    public RoleId RoleId { get; private set; }

    private UserRole()
    {
    }

    public UserRole(
        UserRoleId id,
        UserId userId,
        RoleId roleId)
        : base(id)
    {
        UserId = userId;
        RoleId = roleId;
    }
}