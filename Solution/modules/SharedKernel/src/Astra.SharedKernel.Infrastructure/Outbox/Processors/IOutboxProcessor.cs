namespace Astra.SharedKernel.Infrastructure.Outbox.Processors;

public interface IOutboxProcessor
{
    Task ProcessAsync(
        CancellationToken cancellationToken = default);
}