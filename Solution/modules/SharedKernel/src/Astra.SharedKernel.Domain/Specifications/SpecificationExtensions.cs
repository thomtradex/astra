namespace Astra.SharedKernel.Domain.Specifications;

public static class SpecificationExtensions
{
    public static Specification<T> And<T>(
        this ISpecification<T> left,
        ISpecification<T> right)
    {
        return new AndSpecification<T>(
            left,
            right);
    }

    public static Specification<T> Or<T>(
        this ISpecification<T> left,
        ISpecification<T> right)
    {
        return new OrSpecification<T>(
            left,
            right);
    }

    public static Specification<T> Not<T>(
        this ISpecification<T> specification)
    {
        return new NotSpecification<T>(
            specification);
    }
}