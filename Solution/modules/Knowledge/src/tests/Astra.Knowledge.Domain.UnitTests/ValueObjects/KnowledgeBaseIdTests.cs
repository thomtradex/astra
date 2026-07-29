using Astra.Knowledge.Domain.ValueObjects;
using Xunit;

namespace Astra.Knowledge.Domain.UnitTests.ValueObjects;

public sealed class KnowledgeBaseIdTests
{
    [Fact]
    public void New_ShouldGenerateUniqueId()
    {
        var first = KnowledgeBaseId.New();
        var second = KnowledgeBaseId.New();

        Assert.NotEqual(first, second);
        Assert.NotEqual(Guid.Empty, first.Value);
        Assert.NotEqual(Guid.Empty, second.Value);
    }

    [Fact]
    public void ImplicitConversion_ShouldRoundTripGuid()
    {
        Guid guid = Guid.NewGuid();

        KnowledgeBaseId id = guid;
        Guid converted = id;

        Assert.Equal(guid, converted);
    }
}