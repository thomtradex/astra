using System.Text.Json;

namespace Astra.SharedKernel.Infrastructure.Serialization;

public static class JsonSerializerOptionsProvider
{
    public static readonly JsonSerializerOptions Default = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };
}