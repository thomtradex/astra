using Astra.Memory.Domain.ValueObjects;

namespace Astra.Memory.Domain.UnitTests.ValueObjects;

public sealed class MemoryEntryIdTests
{
    [Fact]
    public void New_ShouldCreateNonEmptyGuid()
    {
        // Act
        var id = MemoryEntryId.New();

        // Assert
        Assert.NotEqual(Guid.Empty, id.Value);
    }

    [Fact]
    public void ToString_ShouldReturnGuidString()
    {
        // Arrange
        var guid = Guid.NewGuid();
        var id = new MemoryEntryId(guid);

        // Act
        var result = id.ToString();

        // Assert
        Assert.Equal(guid.ToString(), result);
    }
}