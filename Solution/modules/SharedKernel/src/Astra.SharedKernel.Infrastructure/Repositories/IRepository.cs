using Astra.SharedKernel.Domain.Entities;

namespace Astra.SharedKernel.Infrastructure.Repositories;

public interface IRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : notnull
{
    Task<TEntity?> GetByIdAsync(
        TId id,
        CancellationToken cancellationToken = default);

    Task AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default);

    void Remove(
        TEntity entity);
}