namespace Astra.SharedKernel.Domain.Search;

public sealed class SearchQuery
{
    public string? Text { get; init; }

    public IReadOnlyCollection<SearchField> Fields { get; init; }
        = [];
}