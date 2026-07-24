namespace Astra.SharedKernel.Domain.Sorting;

public sealed record SortRequest(
    string Property,
    SortDirection Direction = SortDirection.Ascending);