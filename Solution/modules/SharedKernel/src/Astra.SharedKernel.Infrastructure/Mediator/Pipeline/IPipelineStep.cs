namespace Astra.SharedKernel.Infrastructure.Mediator.Pipeline;

public interface IPipelineStep<TRequest>
{
    Task ExecuteAsync(
        TRequest request,
        PipelineContext context,
        Func<Task> next,
        CancellationToken cancellationToken = default);
}