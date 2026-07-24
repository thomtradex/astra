using Astra.SharedKernel.Domain.EventBus;

namespace Astra.SharedKernel.Infrastructure.EventBus.Dispatching;

public sealed class EventDispatcher
    : IEventDispatcher
{
    private readonly IServiceProvider _serviceProvider;

    public EventDispatcher(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public Task DispatchAsync<TEvent>(
        TEvent @event,
        CancellationToken cancellationToken = default)
        where TEvent : IIntegrationEvent
    {
        return Task.CompletedTask;
    }
}