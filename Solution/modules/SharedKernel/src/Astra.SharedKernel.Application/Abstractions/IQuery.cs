using MediatR;

namespace Astra.SharedKernel.Application.Abstractions;

public interface IQuery<TResponse> : IRequest<TResponse>
{
}