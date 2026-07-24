using Astra.SharedKernel.Domain.EventBus;

namespace Astra.SharedKernel.Infrastructure.EventBus;

public sealed class InMemoryEventBus
    : IEventBus
{
    public Task PublishAsync<TEvent>(
        TEvent @event,
        CancellationToken cancellationToken = default)
        where TEvent : IIntegrationEvent
    {
        return Task.CompletedTask;
    }
}