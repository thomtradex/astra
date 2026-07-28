using Astra.Knowledge.Domain.Entities;
using Astra.Knowledge.Domain.ValueObjects;
using Xunit;

namespace Astra.Knowledge.Domain.UnitTests.Entities;

public sealed class DocumentChunkTests
{
    [Fact]
    public void Constructor_Should_Set_Properties()
    {
        var id = DocumentChunkId.New();
        var documentId = DocumentId.New();
        var now = DateTime.UtcNow;

        var chunk = new DocumentChunk(
            id,
            documentId,
            1,
            "content",
            now);

        Assert.Equal(id, chunk.Id);
        Assert.Equal(documentId, chunk.DocumentId);
        Assert.Equal(1, chunk.Index);
        Assert.Equal("content", chunk.Content);
        Assert.Equal(now, chunk.CreatedAtUtc);
    }

    [Fact]
    public void UpdateContent_Should_Update_Content()
    {
        var chunk = new DocumentChunk(
            DocumentChunkId.New(),
            DocumentId.New(),
            1,
            "old",
            DateTime.UtcNow);

        chunk.UpdateContent("new");

        Assert.Equal("new", chunk.Content);
    }
}