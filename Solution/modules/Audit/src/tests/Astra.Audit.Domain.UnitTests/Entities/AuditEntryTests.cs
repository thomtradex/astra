using Astra.Audit.Domain.Entities;
using Xunit;

namespace Astra.Audit.Domain.UnitTests.Entities;

public sealed class AuditEntryTests
{
    [Fact]
    public void AuditEntry_Type_Should_Exist()
    {
        Assert.NotNull(typeof(AuditEntry));
    }

    [Fact]
    public void AuditEntry_Should_Be_Class()
    {
        Assert.True(typeof(AuditEntry).IsClass);
    }
}