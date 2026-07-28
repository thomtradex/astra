using Astra.Identity.Domain.ValueObjects;
using Xunit;

namespace Astra.Identity.UnitTests.Domain.ValueObjects;

public sealed class FullNameTests
{
    [Fact]
    public void Constructor_ShouldTrim()
    {
        var value = new FullName(" João ");

        Assert.Equal("João", value.Value);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenEmpty()
    {
        Assert.Throws<ArgumentException>(() =>
            new FullName(""));
    }

    [Fact]
    public void ToString_ReturnsValue()
    {
        var value = new FullName("Maria");

        Assert.Equal("Maria", value.ToString());
    }
}