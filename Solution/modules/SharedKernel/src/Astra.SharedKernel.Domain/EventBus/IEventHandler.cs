namespace Astra.SharedKernel.Domain.EventBus;

public interface IEventHandler<TEvent>
    where TEvent : IIntegrationEvent
{
    Task HandleAsync(
        TEvent @event,
        CancellationToken cancellationToken = default);
}