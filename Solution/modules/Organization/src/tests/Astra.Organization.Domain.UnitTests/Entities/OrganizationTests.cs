using OrganizationEntity = Astra.Organization.Domain.Entities.Organization;
using Xunit;

namespace Astra.Organization.Domain.UnitTests.Entities;

public sealed class OrganizationTests
{
    [Fact]
    public void Constructor_Should_Create_Instance()
    {
        var organization = new OrganizationEntity(
            "Astra",
            "astra");

        Assert.NotNull(organization);
        Assert.Equal("Astra", organization.Name);
        Assert.Equal("astra", organization.Slug);
    }

    [Fact]
    public void Update_Should_Change_Name_And_Slug()
    {
        var organization = new OrganizationEntity(
            "Old",
            "old");

        organization.Update(
            "New",
            "new");

        Assert.Equal("New", organization.Name);
        Assert.Equal("new", organization.Slug);
    }
}