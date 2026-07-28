using Astra.Identity.Domain.ValueObjects;
using Xunit;

namespace Astra.Identity.UnitTests.Domain.ValueObjects;

public sealed class PasswordHashTests
{
    [Fact]
    public void Constructor_ShouldStoreValue()
    {
        var hash = new PasswordHash("HASH123");

        Assert.Equal("HASH123", hash.Value);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenEmpty()
    {
        Assert.Throws<ArgumentException>(() =>
            new PasswordHash(""));
    }

    [Fact]
    public void TwoHashes_WithSameValue_AreEqual()
    {
        var a = new PasswordHash("HASH");
        var b = new PasswordHash("HASH");

        Assert.Equal(a, b);
    }
}