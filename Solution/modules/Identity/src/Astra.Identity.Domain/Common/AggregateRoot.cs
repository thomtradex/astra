namespace Astra.Identity.Domain.Common;

public abstract class AggregateRoot<TId> : Entity<TId>
{
    protected AggregateRoot()
        : base(default!)
    {
    }

    protected AggregateRoot(TId id)
        : base(id)
    {
    }
}