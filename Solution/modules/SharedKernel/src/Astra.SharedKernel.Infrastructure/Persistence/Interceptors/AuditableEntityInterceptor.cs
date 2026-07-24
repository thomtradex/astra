using Astra.SharedKernel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Astra.SharedKernel.Infrastructure.Persistence.Interceptors;

public sealed class AuditableEntityInterceptor
    : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
        {
            UpdateAuditFields(eventData.Context);
        }

        return base.SavingChanges(eventData, result);
    }

    private static void UpdateAuditFields(
        DbContext context)
    {
        var entries = context.ChangeTracker
            .Entries()
            .Where(entry =>
                entry.Entity is Entity<Guid> &&
                (entry.State == EntityState.Added ||
                 entry.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                var createdProperty = entry.Property("CreatedAt");

                if (createdProperty.Metadata != null)
                {
                    createdProperty.CurrentValue = DateTime.UtcNow;
                }
            }

            var updatedProperty = entry.Property("UpdatedAt");

            if (updatedProperty.Metadata != null)
            {
                updatedProperty.CurrentValue = DateTime.UtcNow;
            }
        }
    }
}