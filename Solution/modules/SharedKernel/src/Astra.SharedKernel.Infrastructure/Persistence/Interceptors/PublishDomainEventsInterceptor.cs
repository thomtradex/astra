using Astra.SharedKernel.Application.Interfaces;
using Astra.SharedKernel.Domain.Entities;
using Astra.SharedKernel.Domain.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Astra.SharedKernel.Infrastructure.Persistence.Interceptors;

public sealed class PublishDomainEventsInterceptor
    : SaveChangesInterceptor
{
    private readonly IDomainEventDispatcher _dispatcher;

    public PublishDomainEventsInterceptor(
        IDomainEventDispatcher dispatcher)
    {
        _dispatcher = dispatcher;
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is null)
        {
            return await base.SavedChangesAsync(
                eventData,
                result,
                cancellationToken);
        }

        var domainEvents = eventData.Context.ChangeTracker
            .Entries()
            .Where(e => e.Entity is Entity<Guid>)
            .Select(e => (Entity<Guid>)e.Entity)
            .SelectMany(e =>
            {
                var events = e.DomainEvents.ToList();

                e.ClearDomainEvents();

                return events;
            })
            .ToList();

        if (domainEvents.Count > 0)
        {
            await _dispatcher.DispatchAsync(
                domainEvents,
                cancellationToken);
        }

        return await base.SavedChangesAsync(
            eventData,
            result,
            cancellationToken);
    }
}