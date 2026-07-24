using MediatR;

namespace Astra.SharedKernel.Application.Abstractions;

public interface ICommandHandler<in TCommand, TResult>
    : IRequestHandler<TCommand, TResult>
    where TCommand : ICommand<TResult>
{
}