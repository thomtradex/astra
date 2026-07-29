using Astra.Audit.Domain.Entities;
using Astra.Audit.Domain.ValueObjects;

namespace Astra.Audit.Domain.Repositories;

public interface IAuditEntryRepository
{
    Task AddAsync(
        AuditEntry entry,
        CancellationToken cancellationToken = default);

    Task<AuditEntry?> GetByIdAsync(
        AuditEntryId id,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}