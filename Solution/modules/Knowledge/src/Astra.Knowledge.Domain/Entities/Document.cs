using Astra.Knowledge.Domain.ValueObjects;

namespace Astra.Knowledge.Domain.Entities;

public sealed class Document
{
    public DocumentId Id { get; private set; }

    public KnowledgeBaseId KnowledgeBaseId { get; private set; }

    public string Title { get; private set; }

    public string FileName { get; private set; }

    public string ContentType { get; private set; }

    public long Size { get; private set; }

    public DateTime UploadedAtUtc { get; private set; }

    private Document()
    {
    }

    public Document(
        DocumentId id,
        KnowledgeBaseId knowledgeBaseId,
        string title,
        string fileName,
        string contentType,
        long size,
        DateTime uploadedAtUtc)
    {
        Id = id;
        KnowledgeBaseId = knowledgeBaseId;
        Title = title;
        FileName = fileName;
        ContentType = contentType;
        Size = size;
        UploadedAtUtc = uploadedAtUtc;
    }

    public void Rename(
        string title)
    {
        Title = title;
    }
}