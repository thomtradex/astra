namespace Astra.SharedKernel.Application.Interfaces;

public interface ICacheService
{
    Task<T?> GetAsync<T>(
        ICacheKey key,
        CancellationToken cancellationToken = default);

    Task SetAsync<T>(
        ICacheKey key,
        T value,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default);

    Task RemoveAsync(
        ICacheKey key,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        ICacheKey key,
        CancellationToken cancellationToken = default);
}