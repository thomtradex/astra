using Astra.Audit.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Audit.Domain.Entities;

public sealed class AuditEntry
{
    public AuditEntryId Id { get; private set; }

    public OrganizationId OrganizationId { get; private set; }

    public string Action { get; private set; }

    public string EntityName { get; private set; }

    public string EntityId { get; private set; }

    public string? PerformedBy { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private AuditEntry()
    {
        Action = null!;
        EntityName = null!;
        EntityId = null!;
    }

    public AuditEntry(
        OrganizationId organizationId,
        string action,
        string entityName,
        string entityId,
        string? performedBy = null)
    {
        Id = AuditEntryId.New();
        OrganizationId = organizationId;
        Action = action;
        EntityName = entityName;
        EntityId = entityId;
        PerformedBy = performedBy;
        CreatedAtUtc = DateTime.UtcNow;
    }
}