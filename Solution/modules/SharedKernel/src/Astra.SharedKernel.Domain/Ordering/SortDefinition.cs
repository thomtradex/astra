namespace Astra.SharedKernel.Domain.Ordering;

public sealed class SortDefinition
{
    public string Property { get; }

    public SortDirection Direction { get; }

    public SortDefinition(
        string property,
        SortDirection direction = SortDirection.Asc)
    {
        Property = property;

        Direction = direction;
    }
}