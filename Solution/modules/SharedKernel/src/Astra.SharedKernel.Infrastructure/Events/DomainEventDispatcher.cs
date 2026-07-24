using Astra.SharedKernel.Application.Interfaces;
using Astra.SharedKernel.Application.Mediator;
using Astra.SharedKernel.Domain.Events;

namespace Astra.SharedKernel.Infrastructure.Events;

public sealed class DomainEventDispatcher : IDomainEventDispatcher
{
    private readonly IMediator _mediator;

    public DomainEventDispatcher(
        IMediator mediator)
    {
        _mediator = mediator;
    }

    public async Task DispatchAsync(
        IReadOnlyCollection<IDomainEvent> domainEvents,
        CancellationToken cancellationToken = default)
    {
        foreach (var domainEvent in domainEvents)
        {
            await _mediator.Publish(
                domainEvent,
                cancellationToken);
        }
    }
}