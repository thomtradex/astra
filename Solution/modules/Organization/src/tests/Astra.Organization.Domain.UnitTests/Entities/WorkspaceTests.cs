using Astra.Organization.Domain.ValueObjects;
using Xunit;

using WorkspaceEntity = Astra.Organization.Domain.Entities.Workspace;

namespace Astra.Organization.Domain.UnitTests.Entities;

public sealed class WorkspaceTests
{
    [Fact]
    public void Constructor_Should_Create_Instance()
    {
        var id = WorkspaceId.New();
        var organizationId = OrganizationId.New();
        var createdAt = DateTime.UtcNow;

        var workspace = new WorkspaceEntity(
            id,
            organizationId,
            "Development",
            "development",
            createdAt);

        Assert.Equal(id, workspace.Id);
        Assert.Equal(organizationId, workspace.OrganizationId);
        Assert.Equal("Development", workspace.Name);
        Assert.Equal("development", workspace.Slug);
        Assert.Equal(createdAt, workspace.CreatedAtUtc);
    }

    [Fact]
    public void Rename_Should_Change_Name()
    {
        var workspace = new WorkspaceEntity(
            WorkspaceId.New(),
            OrganizationId.New(),
            "Old",
            "workspace",
            DateTime.UtcNow);

        workspace.Rename("New");

        Assert.Equal("New", workspace.Name);
    }

    [Fact]
    public void ChangeSlug_Should_Change_Slug()
    {
        var workspace = new WorkspaceEntity(
            WorkspaceId.New(),
            OrganizationId.New(),
            "Workspace",
            "old",
            DateTime.UtcNow);

        workspace.ChangeSlug("new");

        Assert.Equal("new", workspace.Slug);
    }
}