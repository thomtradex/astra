using System.Linq.Expressions;

namespace Astra.SharedKernel.Domain.Specifications;

public sealed class NotSpecification<T>
    : Specification<T>
{
    private readonly ISpecification<T> _specification;

    public NotSpecification(
        ISpecification<T> specification)
    {
        _specification = specification;
    }

    public override Expression<Func<T, bool>> Criteria =>
        entity => !_specification.Criteria.Compile()(entity);
}