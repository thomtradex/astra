using Astra.Organization.Domain.ValueObjects;
using Astra.Workflow.Domain.Entities;
using Xunit;

namespace Astra.Workflow.Domain.UnitTests.Entities;

public sealed class WorkflowDefinitionTests
{
    [Fact]
    public void Constructor_Should_Create_Workflow()
    {
        var organizationId = OrganizationId.New();

        var workflow = new WorkflowDefinition(
            organizationId,
            "Approval",
            "Approval workflow");

        Assert.Equal(organizationId, workflow.OrganizationId);
        Assert.Equal("Approval", workflow.Name);
        Assert.Equal("Approval workflow", workflow.Description);
        Assert.True(workflow.Enabled);
        Assert.NotEqual(default, workflow.CreatedAtUtc);
    }
}