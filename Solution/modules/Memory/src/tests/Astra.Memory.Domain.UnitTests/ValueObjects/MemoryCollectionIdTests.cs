using Astra.Memory.Domain.ValueObjects;

namespace Astra.Memory.Domain.UnitTests.ValueObjects;

public sealed class MemoryCollectionIdTests
{
    [Fact]
    public void New_ShouldCreateNonEmptyGuid()
    {
        // Act
        var id = MemoryCollectionId.New();

        // Assert
        Assert.NotEqual(Guid.Empty, id.Value);
    }

    [Fact]
    public void ToString_ShouldReturnGuidString()
    {
        // Arrange
        var guid = Guid.NewGuid();
        var id = new MemoryCollectionId(guid);

        // Act
        var result = id.ToString();

        // Assert
        Assert.Equal(guid.ToString(), result);
    }
}