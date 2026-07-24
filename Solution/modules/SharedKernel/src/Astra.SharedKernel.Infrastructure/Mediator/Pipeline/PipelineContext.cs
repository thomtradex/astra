namespace Astra.SharedKernel.Infrastructure.Mediator.Pipeline;

public sealed class PipelineContext
{
    public IServiceProvider Services { get; }

    public PipelineContext(
        IServiceProvider services)
    {
        Services = services;
    }
}