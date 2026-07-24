using Astra.SharedKernel.Domain.Entities;

namespace Astra.SharedKernel.Domain.Entities;

public abstract class AggregateRoot<TId>
    : Entity<TId>, IAggregateRoot
    where TId : notnull
{
}