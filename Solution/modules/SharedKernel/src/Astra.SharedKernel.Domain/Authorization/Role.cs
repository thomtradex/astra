namespace Astra.SharedKernel.Domain.Authorization;

public sealed record Role(
    string Name,
    IReadOnlyCollection<string> Permissions);