using Astra.Knowledge.Domain.ValueObjects;
using Xunit;

namespace Astra.Knowledge.Domain.UnitTests.ValueObjects;

public sealed class DocumentChunkIdTests
{
    [Fact]
    public void New_ShouldGenerateUniqueId()
    {
        var first = DocumentChunkId.New();
        var second = DocumentChunkId.New();

        Assert.NotEqual(first, second);
        Assert.NotEqual(Guid.Empty, first.Value);
        Assert.NotEqual(Guid.Empty, second.Value);
    }

    [Fact]
    public void ImplicitConversion_ShouldRoundTripGuid()
    {
        Guid guid = Guid.NewGuid();

        DocumentChunkId id = guid;
        Guid converted = id;

        Assert.Equal(guid, converted);
    }
}