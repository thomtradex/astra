using MediatR;

namespace Astra.SharedKernel.Application.Commands;

public interface ICommand : IRequest
{
}

public interface ICommand<out TResponse> : IRequest<TResponse>
{
}