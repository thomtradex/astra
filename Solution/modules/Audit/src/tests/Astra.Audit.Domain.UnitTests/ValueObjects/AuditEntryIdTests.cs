using Astra.Audit.Domain.ValueObjects;
using Xunit;

namespace Astra.Audit.Domain.UnitTests.ValueObjects;

public sealed class AuditEntryIdTests
{
    [Fact]
    public void New_Should_Create_Different_Ids()
    {
        var first = AuditEntryId.New();
        var second = AuditEntryId.New();

        Assert.NotEqual(first, second);
    }

    [Fact]
    public void ToString_Should_Not_Be_Empty()
    {
        var id = AuditEntryId.New();

        Assert.False(string.IsNullOrWhiteSpace(id.ToString()));
    }
}