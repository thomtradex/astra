namespace Astra.SharedKernel.Domain.Filtering;

public sealed record FilterRule(
    string Property,
    FilterOperator Operator,
    string Value);