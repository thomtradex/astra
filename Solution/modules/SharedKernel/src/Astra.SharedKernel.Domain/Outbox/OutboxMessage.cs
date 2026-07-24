namespace Astra.SharedKernel.Domain.Outbox;

public sealed class OutboxMessage
    : IOutboxMessage
{
    public Guid Id { get; init; }

    public DateTime OccurredOnUtc { get; init; }

    public string Type { get; init; } = string.Empty;

    public string Payload { get; init; } = string.Empty;

    public DateTime? ProcessedOnUtc { get; private set; }

    public void MarkAsProcessed(
        DateTime processedOnUtc)
    {
        ProcessedOnUtc = processedOnUtc;
    }
}