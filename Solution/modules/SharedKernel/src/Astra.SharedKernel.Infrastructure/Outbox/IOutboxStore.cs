namespace Astra.SharedKernel.Infrastructure.Outbox;

public interface IOutboxStore
{
    Task AddAsync(
        OutboxMessage message,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<OutboxMessage>> GetPendingAsync(
        CancellationToken cancellationToken = default);

    Task MarkAsProcessedAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}