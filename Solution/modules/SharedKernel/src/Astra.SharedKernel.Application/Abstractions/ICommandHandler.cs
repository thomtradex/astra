using MediatR;

namespace Astra.SharedKernel.Application.Abstractions;

public interface ICommandHandler<in TCommand>
    : IRequestHandler<TCommand>
    where TCommand : ICommand
{
}
