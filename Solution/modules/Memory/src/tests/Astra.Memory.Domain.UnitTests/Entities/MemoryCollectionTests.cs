using Astra.Memory.Domain.Entities;
using Astra.Organization.Domain.ValueObjects;

namespace Astra.Memory.Domain.UnitTests.Entities;

public sealed class MemoryCollectionTests
{
    [Fact]
    public void Constructor_ShouldInitializeProperties()
    {
        // Arrange
        var organizationId = new OrganizationId(Guid.NewGuid());
        const string name = "Knowledge";
        const string description = "Knowledge base";

        // Act
        var collection = new MemoryCollection(
            organizationId,
            name,
            description);

        // Assert
        Assert.NotEqual(Guid.Empty, collection.Id.Value);
        Assert.Equal(organizationId, collection.OrganizationId);
        Assert.Equal(name, collection.Name);
        Assert.Equal(description, collection.Description);
    }

    [Fact]
    public void Constructor_ShouldSetCreatedAtUtc()
    {
        // Arrange
        var before = DateTime.UtcNow;

        // Act
        var collection = new MemoryCollection(
            new OrganizationId(Guid.NewGuid()),
            "Knowledge",
            "Description");

        var after = DateTime.UtcNow;

        // Assert
        Assert.InRange(
            collection.CreatedAtUtc,
            before,
            after);
    }
}