namespace Astra.SharedKernel.Domain.Pagination;

public sealed class PagedQuery
{
    public int Page { get; init; } = 1;

    public int PageSize { get; init; } = 25;

    public int Skip
        => (Page - 1) * PageSize;
}