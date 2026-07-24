namespace Astra.SharedKernel.Domain.Filtering;

public sealed class FilterDefinition
{
    public string Property { get; }

    public object? Value { get; }

    public FilterOperator Operator { get; }

    public FilterDefinition(
        string property,
        object? value,
        FilterOperator @operator = FilterOperator.Equal)
    {
        Property = property;

        Value = value;

        Operator = @operator;
    }
}