namespace Astra.SharedKernel.Domain.Search;

public sealed class SearchField
{
    public string Property { get; }

    public SearchField(
        string property)
    {
        Property = property;
    }
}