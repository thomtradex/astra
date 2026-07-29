using Astra.Memory.Domain.Entities;
using Astra.Memory.Domain.ValueObjects;

namespace Astra.Memory.Domain.UnitTests.Entities;

public sealed class MemoryEntryTests
{
    [Fact]
    public void Constructor_ShouldInitializeProperties()
    {
        // Arrange
        var collectionId = MemoryCollectionId.New();

        // Act
        var entry = new MemoryEntry(
            collectionId,
            "language",
            "C#",
            "embedding-1");

        // Assert
        Assert.NotEqual(Guid.Empty, entry.Id.Value);
        Assert.Equal(collectionId, entry.MemoryCollectionId);
        Assert.Equal("language", entry.Key);
        Assert.Equal("C#", entry.Value);
        Assert.Equal("embedding-1", entry.EmbeddingId);
    }

    [Fact]
    public void Constructor_ShouldSetCreatedAtUtc()
    {
        // Arrange
        var before = DateTime.UtcNow;

        // Act
        var entry = new MemoryEntry(
            MemoryCollectionId.New(),
            "language",
            "C#");

        var after = DateTime.UtcNow;

        // Assert
        Assert.InRange(
            entry.CreatedAtUtc,
            before,
            after);
    }
}