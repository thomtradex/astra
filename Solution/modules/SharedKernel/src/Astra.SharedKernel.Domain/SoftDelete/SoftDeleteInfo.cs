namespace Astra.SharedKernel.Domain.SoftDelete;

public sealed class SoftDeleteInfo
{
    public bool IsDeleted { get; private set; }

    public DateTime? DeletedAtUtc { get; private set; }

    public Guid? DeletedBy { get; private set; }

    public void Delete(
        DateTime deletedAtUtc,
        Guid? deletedBy = null)
    {
        IsDeleted = true;
        DeletedAtUtc = deletedAtUtc;
        DeletedBy = deletedBy;
    }

    public void Restore()
    {
        IsDeleted = false;
        DeletedAtUtc = null;
        DeletedBy = null;
    }
}