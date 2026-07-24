namespace Astra.SharedKernel.Domain.Factories;

public interface IEntityFactory<out TEntity>
{
    TEntity Create();
}