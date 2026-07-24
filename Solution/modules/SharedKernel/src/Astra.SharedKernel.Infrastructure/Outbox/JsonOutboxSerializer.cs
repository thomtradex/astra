using System.Text.Json;
using Astra.SharedKernel.Infrastructure.Serialization;

namespace Astra.SharedKernel.Infrastructure.Outbox;

public sealed class JsonOutboxSerializer
    : IOutboxSerializer
{
    public string Serialize(object value)
    {
        return JsonSerializer.Serialize(
            value,
            JsonSerializerOptionsProvider.Default);
    }

    public object? Deserialize(
        string content,
        Type type)
    {
        return JsonSerializer.Deserialize(
            content,
            type,
            JsonSerializerOptionsProvider.Default);
    }
}