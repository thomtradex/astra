namespace Astra.SharedKernel.Domain.Auditing;

public sealed class AuditInfo
{
    public DateTime CreatedAtUtc { get; private set; }

    public Guid? CreatedBy { get; private set; }

    public DateTime? LastModifiedAtUtc { get; private set; }

    public Guid? LastModifiedBy { get; private set; }

    public void SetCreated(
        DateTime createdAtUtc,
        Guid? createdBy = null)
    {
        CreatedAtUtc = createdAtUtc;
        CreatedBy = createdBy;
    }

    public void SetModified(
        DateTime modifiedAtUtc,
        Guid? modifiedBy = null)
    {
        LastModifiedAtUtc = modifiedAtUtc;
        LastModifiedBy = modifiedBy;
    }
}