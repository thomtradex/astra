using Astra.SharedKernel.Domain.Entities;
using Astra.SharedKernel.Domain.Events;

namespace Astra.SharedKernel.Domain.Entities;

public abstract class Entity<TId> : IEntity
    where TId : notnull
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public TId Id { get; protected set; } = default!;

    public IReadOnlyCollection<IDomainEvent> DomainEvents
        => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(
        IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}