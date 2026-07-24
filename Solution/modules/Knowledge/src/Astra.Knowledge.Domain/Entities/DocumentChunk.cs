using Astra.Knowledge.Domain.ValueObjects;

namespace Astra.Knowledge.Domain.Entities;

public sealed class DocumentChunk
{
    public DocumentChunkId Id { get; private set; }

    public DocumentId DocumentId { get; private set; }

    public int Index { get; private set; }

    public string Content { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private DocumentChunk()
    {
    }

    public DocumentChunk(
        DocumentChunkId id,
        DocumentId documentId,
        int index,
        string content,
        DateTime createdAtUtc)
    {
        Id = id;
        DocumentId = documentId;
        Index = index;
        Content = content;
        CreatedAtUtc = createdAtUtc;
    }

    public void UpdateContent(
        string content)
    {
        Content = content;
    }
}