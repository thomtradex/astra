using MediatR;

namespace Astra.SharedKernel.Application.Abstractions;

public interface ICommand<TResponse> : IRequest<TResponse>
{
}