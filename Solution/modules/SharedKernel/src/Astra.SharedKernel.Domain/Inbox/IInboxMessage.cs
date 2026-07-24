namespace Astra.SharedKernel.Domain.Inbox;

public interface IInboxMessage
{
    Guid Id { get; }

    DateTime ReceivedOnUtc { get; }

    string Type { get; }

    string Payload { get; }

    bool Processed { get; }
}