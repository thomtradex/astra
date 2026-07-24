using System.Linq.Expressions;

namespace Astra.SharedKernel.Domain.Specifications;

public abstract class Specification<T>
    : ISpecification<T>
{
    public abstract Expression<Func<T, bool>> Criteria { get; }
}