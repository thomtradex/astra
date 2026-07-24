namespace Astra.SharedKernel.Domain.Authorization;

public interface IPermissionChecker
{
    Task<bool> HasPermissionAsync(
        string permission,
        CancellationToken cancellationToken = default);
}