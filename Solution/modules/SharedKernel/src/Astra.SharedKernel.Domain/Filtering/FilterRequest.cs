namespace Astra.SharedKernel.Domain.Filtering;

public sealed class FilterRequest
{
    public IReadOnlyCollection<FilterRule> Rules { get; }

    public FilterRequest(
        IReadOnlyCollection<FilterRule> rules)
    {
        Rules = rules;
    }

    public static FilterRequest Empty
        => new([]);
}