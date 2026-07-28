using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.ValueObjects;
using Xunit;

namespace Astra.Knowledge.Domain.UnitTests.Entities;

public sealed class DocumentTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var id = DocumentId.New();
        var kbId = KnowledgeBaseId.New();
        var now = DateTime.UtcNow;

        var document = new Document(
            id,
            kbId,
            "Guide",
            "guide.pdf",
            "application/pdf",
            100,
            now);

        Assert.Equal(id, document.Id);
        Assert.Equal(kbId, document.KnowledgeBaseId);
        Assert.Equal("Guide", document.Title);
        Assert.Equal("guide.pdf", document.FileName);
        Assert.Equal("application/pdf", document.ContentType);
        Assert.Equal(100, document.Size);
        Assert.Equal(now, document.UploadedAtUtc);
    }

    [Fact]
    public void Rename_Should_Update_Title()
    {
        var document = new Document(
            DocumentId.New(),
            KnowledgeBaseId.New(),
            "Old",
            "file.pdf",
            "application/pdf",
            10,
            DateTime.UtcNow);

        document.Rename("New");

        Assert.Equal("New", document.Title);
    }
}