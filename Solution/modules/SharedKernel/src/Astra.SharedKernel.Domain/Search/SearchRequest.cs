namespace Astra.SharedKernel.Domain.Search;

public sealed record SearchRequest(
    string Query,
    int MaxResults = 20);