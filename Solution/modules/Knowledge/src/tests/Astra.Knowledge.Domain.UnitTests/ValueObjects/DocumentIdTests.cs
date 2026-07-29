using Astra.Knowledge.Domain.ValueObjects;
using Xunit;

namespace Astra.Knowledge.Domain.UnitTests.ValueObjects;

public sealed class DocumentIdTests
{
    [Fact]
    public void New_ShouldGenerateUniqueId()
    {
        var first = DocumentId.New();
        var second = DocumentId.New();

        Assert.NotEqual(first, second);
        Assert.NotEqual(Guid.Empty, first.Value);
        Assert.NotEqual(Guid.Empty, second.Value);
    }

    [Fact]
    public void ImplicitConversion_ShouldRoundTripGuid()
    {
        Guid guid = Guid.NewGuid();

        DocumentId id = guid;
        Guid converted = id;

        Assert.Equal(guid, converted);
    }
}