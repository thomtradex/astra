using Astra.SharedKernel.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Astra.SharedKernel.Infrastructure.Repositories;

public class Repository<TEntity, TId>
    : IRepository<TEntity, TId>
    where TEntity : Entity<TId>
    where TId : notnull
{
    private readonly DbContext _context;

    private readonly DbSet<TEntity> _dbSet;

    public Repository(
        DbContext context)
    {
        _context = context;

        _dbSet = context.Set<TEntity>();
    }

    public async Task<TEntity?> GetByIdAsync(
        TId id,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(
            [id],
            cancellationToken);
    }

    public async Task AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(
            entity,
            cancellationToken);
    }

    public void Remove(
        TEntity entity)
    {
        _dbSet.Remove(entity);
    }
}