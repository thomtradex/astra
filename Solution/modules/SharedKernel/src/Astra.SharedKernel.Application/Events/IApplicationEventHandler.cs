namespace Astra.SharedKernel.Application.Events;

public interface IApplicationEventHandler<in TEvent>
    where TEvent : IApplicationEvent
{
    Task Handle(
        TEvent applicationEvent,
        CancellationToken cancellationToken = default);
}