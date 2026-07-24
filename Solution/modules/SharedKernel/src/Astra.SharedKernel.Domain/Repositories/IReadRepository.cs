namespace Astra.SharedKernel.Domain.Repositories;

public interface IReadRepository<TEntity, TId>
    : IRepository
    where TEntity : class
    where TId : notnull
{
    Task<TEntity?> GetByIdAsync(
        TId id,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        TId id,
        CancellationToken cancellationToken = default);
}