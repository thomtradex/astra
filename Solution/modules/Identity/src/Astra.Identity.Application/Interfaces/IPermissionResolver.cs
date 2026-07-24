using Astra.Identity.Domain.ValueObjects;

namespace Astra.Identity.Application.Interfaces;

public interface IPermissionResolver
{
    Task<IReadOnlyCollection<string>> ResolveAsync(
        UserId userId,
        CancellationToken cancellationToken = default);
}