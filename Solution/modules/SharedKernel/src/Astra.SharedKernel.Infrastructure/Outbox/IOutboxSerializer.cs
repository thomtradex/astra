namespace Astra.SharedKernel.Infrastructure.Outbox;

public interface IOutboxSerializer
{
    string Serialize(object value);

    object? Deserialize(
        string content,
        Type type);
}