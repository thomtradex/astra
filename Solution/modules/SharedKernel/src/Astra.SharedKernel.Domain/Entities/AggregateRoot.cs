using Astra.SharedKernel.Domain.Interfaces;

namespace Astra.SharedKernel.Domain.Entities;

public abstract class AggregateRoot<TId> : Entity<TId>, IAggregateRoot
    where TId : notnull
{
    protected AggregateRoot()
    {
    }

    protected AggregateRoot(TId id)
        : base(id)
    {
    }
}