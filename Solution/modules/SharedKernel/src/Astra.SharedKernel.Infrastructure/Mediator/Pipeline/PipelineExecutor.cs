namespace Astra.SharedKernel.Infrastructure.Mediator.Pipeline;

public sealed class PipelineExecutor
{
    public Task ExecuteAsync<TRequest>(
        IEnumerable<IPipelineStep<TRequest>> pipeline,
        TRequest request,
        PipelineContext context,
        Func<Task> handler,
        CancellationToken cancellationToken = default)
    {
        return handler();
    }
}