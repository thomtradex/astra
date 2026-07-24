using Astra.SharedKernel.Application.Interfaces;

namespace Astra.SharedKernel.Infrastructure.Storage;

public sealed class LocalFileStorage : IFileStorage
{
    private readonly string _rootPath;

    public LocalFileStorage()
    {
        _rootPath = Path.Combine(
            AppContext.BaseDirectory,
            "storage");

        Directory.CreateDirectory(_rootPath);
    }

    public async Task<FileReference> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var id = Guid.NewGuid().ToString("N");

        var path = Path.Combine(_rootPath, id);

        await using var file = File.Create(path);

        await content.CopyToAsync(file, cancellationToken);

        return new FileReference(
            id,
            fileName,
            contentType,
            file.Length);
    }

    public Task<Stream> DownloadAsync(
        string fileId,
        CancellationToken cancellationToken = default)
    {
        Stream stream = File.OpenRead(
            Path.Combine(_rootPath, fileId));

        return Task.FromResult(stream);
    }

    public Task DeleteAsync(
        string fileId,
        CancellationToken cancellationToken = default)
    {
        var path = Path.Combine(_rootPath, fileId);

        if (File.Exists(path))
        {
            File.Delete(path);
        }

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(
        string fileId,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(
            File.Exists(
                Path.Combine(_rootPath, fileId)));
    }
}