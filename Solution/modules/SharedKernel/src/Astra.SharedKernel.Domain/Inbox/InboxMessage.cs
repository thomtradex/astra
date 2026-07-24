namespace Astra.SharedKernel.Domain.Inbox;

public sealed class InboxMessage
    : IInboxMessage
{
    public Guid Id { get; init; }

    public DateTime ReceivedOnUtc { get; init; }

    public string Type { get; init; } = string.Empty;

    public string Payload { get; init; } = string.Empty;

    public bool Processed { get; private set; }

    public DateTime? ProcessedOnUtc { get; private set; }

    public void MarkAsProcessed(
        DateTime processedOnUtc)
    {
        Processed = true;
        ProcessedOnUtc = processedOnUtc;
    }
}