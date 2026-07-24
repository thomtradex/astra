namespace Astra.SharedKernel.Application.Interfaces;

public sealed record FileReference(
    string Id,
    string FileName,
    string ContentType,
    long Size);