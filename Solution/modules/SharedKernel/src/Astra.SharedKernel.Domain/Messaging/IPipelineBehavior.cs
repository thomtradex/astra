namespace Astra.SharedKernel.Domain.Messaging;

public interface IPipelineBehavior<TRequest>
{
    Task HandleAsync(
        TRequest request,
        Func<Task> next,
        CancellationToken cancellationToken = default);
}