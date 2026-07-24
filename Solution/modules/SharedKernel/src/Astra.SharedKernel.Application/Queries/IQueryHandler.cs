namespace Astra.SharedKernel.Application.Queries;

public interface IQueryHandler<in TQuery, TResult>
    where TQuery : IQuery<TResult>
{
    Task<TResult> Handle(
        TQuery query,
        CancellationToken cancellationToken = default);
}