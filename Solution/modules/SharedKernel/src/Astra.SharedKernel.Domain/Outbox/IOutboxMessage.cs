namespace Astra.SharedKernel.Domain.Outbox;

public interface IOutboxMessage
{
    Guid Id { get; }

    DateTime OccurredOnUtc { get; }

    string Type { get; }

    string Payload { get; }
}