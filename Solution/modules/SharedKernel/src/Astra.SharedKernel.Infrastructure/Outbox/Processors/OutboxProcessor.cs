namespace Astra.SharedKernel.Infrastructure.Outbox.Processors;

public sealed class OutboxProcessor
    : IOutboxProcessor
{
    public Task ProcessAsync(
        CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}