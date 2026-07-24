using Astra.SharedKernel.Domain.EventBus;

namespace Astra.SharedKernel.Infrastructure.EventBus.Dispatching;

public interface IEventDispatcher
{
    Task DispatchAsync<TEvent>(
        TEvent @event,
        CancellationToken cancellationToken = default)
        where TEvent : IIntegrationEvent;
}