namespace Astra.SharedKernel.Application.Commands;

public interface ICommandHandler<in TCommand>
    where TCommand : ICommand
{
    Task Handle(
        TCommand command,
        CancellationToken cancellationToken = default);
}