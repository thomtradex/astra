using Astra.SharedKernel.Domain.Events;

namespace Astra.SharedKernel.Application.Interfaces;

public interface IDomainEventDispatcher
{
    Task DispatchAsync(
        IReadOnlyCollection<IDomainEvent> domainEvents,
        CancellationToken cancellationToken = default);
}