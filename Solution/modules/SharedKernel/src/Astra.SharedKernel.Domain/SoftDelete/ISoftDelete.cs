namespace Astra.SharedKernel.Domain.SoftDelete;

public interface ISoftDelete
{
    SoftDeleteInfo SoftDelete { get; }
}