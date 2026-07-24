namespace Astra.SharedKernel.Domain.Search;

public sealed record SearchResult<T>(
    IReadOnlyCollection<T> Items,
    int TotalResults,
    string Query);