using Astra.SharedKernel.Application.Commands;
using Astra.SharedKernel.Application.Events;
using Astra.SharedKernel.Application.Mediator;
using Astra.SharedKernel.Application.Notifications;
using Astra.SharedKernel.Application.Queries;
using Astra.SharedKernel.Domain.Events;

namespace Astra.SharedKernel.Infrastructure.Mediator;

public sealed class Mediator : IMediator
{
    public Task Send(
        ICommand command,
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task<TResult> Send<TResult>(
        IQuery<TResult> query,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(default(TResult)!);
    }

    public Task Publish(
        IDomainEvent domainEvent,
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task Publish(
        IApplicationEvent applicationEvent,
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task Publish(
        INotification notification,
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}