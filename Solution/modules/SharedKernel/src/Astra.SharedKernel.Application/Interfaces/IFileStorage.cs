namespace Astra.SharedKernel.Application.Interfaces;

public interface IFileStorage
{
    Task<FileReference> UploadAsync(
        Stream content,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<Stream> DownloadAsync(
        string fileId,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string fileId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        string fileId,
        CancellationToken cancellationToken = default);
}