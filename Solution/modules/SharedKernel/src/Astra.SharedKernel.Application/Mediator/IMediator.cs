using Astra.SharedKernel.Application.Commands;
using Astra.SharedKernel.Application.Events;
using Astra.SharedKernel.Application.Notifications;
using Astra.SharedKernel.Application.Queries;
using Astra.SharedKernel.Domain.Events;

namespace Astra.SharedKernel.Application.Mediator;

public interface IMediator
{
    Task Send(
        ICommand command,
        CancellationToken cancellationToken = default);

    Task<TResult> Send<TResult>(
        IQuery<TResult> query,
        CancellationToken cancellationToken = default);

    Task Publish(
        IDomainEvent domainEvent,
        CancellationToken cancellationToken = default);

    Task Publish(
        IApplicationEvent applicationEvent,
        CancellationToken cancellationToken = default);

    Task Publish(
        INotification notification,
        CancellationToken cancellationToken = default);
}