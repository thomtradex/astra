using Astra.Memory.Domain.ValueObjects;

namespace Astra.Memory.Domain.Entities;

public sealed class MemoryEntry
{
    public MemoryEntryId Id { get; private set; }

    public MemoryCollectionId MemoryCollectionId { get; private set; }

    public string Key { get; private set; }

    public string Value { get; private set; }

    public string? EmbeddingId { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private MemoryEntry()
    {
        Key = null!;
        Value = null!;
    }

    public MemoryEntry(
        MemoryCollectionId memoryCollectionId,
        string key,
        string value,
        string? embeddingId = null)
    {
        Id = MemoryEntryId.New();
        MemoryCollectionId = memoryCollectionId;
        Key = key;
        Value = value;
        EmbeddingId = embeddingId;
        CreatedAtUtc = DateTime.UtcNow;
    }
}