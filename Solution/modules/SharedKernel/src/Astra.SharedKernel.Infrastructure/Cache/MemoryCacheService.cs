using Astra.SharedKernel.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace Astra.SharedKernel.Infrastructure.Cache;

public sealed class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    public MemoryCacheService(
        IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task<T?> GetAsync<T>(
        ICacheKey key,
        CancellationToken cancellationToken = default)
    {
        _cache.TryGetValue(key.Value, out T? value);

        return Task.FromResult(value);
    }

    public Task SetAsync<T>(
        ICacheKey key,
        T value,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default)
    {
        var options = new MemoryCacheEntryOptions();

        if (expiration.HasValue)
        {
            options.AbsoluteExpirationRelativeToNow = expiration;
        }

        _cache.Set(key.Value, value, options);

        return Task.CompletedTask;
    }

    public Task RemoveAsync(
        ICacheKey key,
        CancellationToken cancellationToken = default)
    {
        _cache.Remove(key.Value);

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(
        ICacheKey key,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(
            _cache.TryGetValue(key.Value, out _));
    }
}