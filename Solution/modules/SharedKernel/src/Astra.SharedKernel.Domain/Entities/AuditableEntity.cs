namespace Astra.SharedKernel.Domain.Entities;

public abstract class AuditableEntity<TId>
    : Entity<TId>
    where TId : notnull
{
    public DateTime CreatedAtUtc { get; protected set; }

    public DateTime? UpdatedAtUtc { get; protected set; }

    protected void MarkUpdated()
    {
        UpdatedAtUtc = DateTime.UtcNow;
    }
}