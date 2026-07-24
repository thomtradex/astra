namespace Astra.SharedKernel.Domain.Messaging;

public interface ICommandHandler<TCommand>
    where TCommand : ICommand
{
    Task HandleAsync(
        TCommand command,
        CancellationToken cancellationToken = default);
}