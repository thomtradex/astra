using System.Linq.Expressions;

namespace Astra.SharedKernel.Domain.Specifications;

public sealed class AndSpecification<T>
    : Specification<T>
{
    private readonly ISpecification<T> _left;

    private readonly ISpecification<T> _right;

    public AndSpecification(
        ISpecification<T> left,
        ISpecification<T> right)
    {
        _left = left;

        _right = right;
    }

    public override Expression<Func<T, bool>> Criteria =>
        entity => _left.Criteria.Compile()(entity)
               && _right.Criteria.Compile()(entity);
}