using Astra.SharedKernel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Astra.SharedKernel.Infrastructure.Persistence;

public abstract class BaseEntityConfiguration<TEntity, TId>
    : IEntityTypeConfiguration<TEntity>
    where TEntity : Entity<TId>
    where TId : notnull
{
    public virtual void Configure(
        EntityTypeBuilder<TEntity> builder)
    {
        builder.HasKey(e => e.Id);
    }
}