using Astra.Identity.Domain.ValueObjects;
using Xunit;

namespace Astra.Identity.UnitTests.Domain.ValueObjects;

public class EmailTests
{
    [Fact]
    public void Should_Create_Email()
    {
        var email = new Email("test@example.com");

        Assert.Equal("test@example.com", email.Value);
    }
}