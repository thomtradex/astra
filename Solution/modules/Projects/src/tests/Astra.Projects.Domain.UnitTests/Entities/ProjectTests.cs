using Astra.Organization.Domain.ValueObjects;
using Astra.Projects.Domain.Entities;
using Xunit;

namespace Astra.Projects.Domain.UnitTests.Entities;

public sealed class ProjectTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var organizationId = OrganizationId.New();

        var project = new Project(
            organizationId,
            "Astra COO",
            "Digital Chief Operating Officer");

        Assert.Equal(organizationId, project.OrganizationId);
        Assert.Equal("Astra COO", project.Name);
        Assert.Equal("Digital Chief Operating Officer", project.Description);
    }
}