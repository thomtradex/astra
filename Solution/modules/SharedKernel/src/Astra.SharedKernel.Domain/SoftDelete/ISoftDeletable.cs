namespace Astra.SharedKernel.Domain.SoftDelete;

public interface ISoftDeletable
{
    bool IsDeleted { get; }

    DateTime? DeletedAtUtc { get; }

    void Delete();

    void Restore();
}