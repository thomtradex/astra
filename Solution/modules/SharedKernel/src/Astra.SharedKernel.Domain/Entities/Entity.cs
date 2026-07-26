using Astra.SharedKernel.Domain.Events;
using Astra.SharedKernel.Domain.Interfaces;

namespace Astra.SharedKernel.Domain.Entities;

public abstract class Entity<TId> : IEntity<TId>
    where TId : notnull
{
    private readonly List<IDomainEvent> _domainEvents = [];

    protected Entity()
    {
    }

    protected Entity(TId id)
    {
        Id = id;
    }

    public TId Id { get; protected set; } = default!;

    public IReadOnlyCollection<IDomainEvent> DomainEvents
        => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}