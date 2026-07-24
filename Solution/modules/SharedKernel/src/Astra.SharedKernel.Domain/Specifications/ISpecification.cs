using System.Linq.Expressions;

namespace Astra.SharedKernel.Domain.Specifications;

public interface ISpecification<T>
{
    Expression<Func<T, bool>> Criteria { get; }
}