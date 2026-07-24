namespace Astra.SharedKernel.Domain.Auditing;

public interface IAuditableEntity
{
    AuditInfo Audit { get; }
}