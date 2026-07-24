namespace Astra.SharedKernel.Domain.Repositories;

public interface IWriteRepository<TEntity>
    : IRepository
    where TEntity : class
{
    Task AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        TEntity entity,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(
        CancellationToken cancellationToken = default);
}