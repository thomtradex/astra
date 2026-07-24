using MediatR;

namespace Astra.SharedKernel.Application.Abstractions;

public interface IQueryHandler<in TQuery, TResult>
    : IRequestHandler<TQuery, TResult>
    where TQuery : IQuery<TResult>
{
}