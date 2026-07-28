using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.ValueObjects;
using Astra.Organization.Domain.ValueObjects;
using Xunit;

namespace Astra.Knowledge.Domain.UnitTests.Entities;

public sealed class KnowledgeBaseTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var id = KnowledgeBaseId.New();
        var organizationId = OrganizationId.New();
        var now = DateTime.UtcNow;

        var kb = new KnowledgeBase(
            id,
            organizationId,
            "Docs",
            "Knowledge base",
            now);

        Assert.Equal(id, kb.Id);
        Assert.Equal(organizationId, kb.OrganizationId);
        Assert.Equal("Docs", kb.Name);
        Assert.Equal("Knowledge base", kb.Description);
        Assert.Equal(now, kb.CreatedAtUtc);
    }

    [Fact]
    public void Rename_Should_Update_Name()
    {
        var kb = new KnowledgeBase(
            KnowledgeBaseId.New(),
            OrganizationId.New(),
            "Old",
            "Desc",
            DateTime.UtcNow);

        kb.Rename("New");

        Assert.Equal("New", kb.Name);
    }

    [Fact]
    public void ChangeDescription_Should_Update_Description()
    {
        var kb = new KnowledgeBase(
            KnowledgeBaseId.New(),
            OrganizationId.New(),
            "Docs",
            "Old",
            DateTime.UtcNow);

        kb.ChangeDescription("New");

        Assert.Equal("New", kb.Description);
    }
}