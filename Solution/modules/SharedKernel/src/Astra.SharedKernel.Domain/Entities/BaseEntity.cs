namespace Astra.SharedKernel.Domain.Entities;

public abstract class BaseEntity<TId> : Entity<TId>
    where TId : notnull
{
}