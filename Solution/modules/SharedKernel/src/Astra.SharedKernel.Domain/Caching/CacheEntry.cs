namespace Astra.SharedKernel.Domain.Caching;

public sealed class CacheEntry<T>
{
    public string Key { get; }

    public T Value { get; }

    public TimeSpan? Expiration { get; }

    public CacheEntry(
        string key,
        T value,
        TimeSpan? expiration = null)
    {
        Key = key;
        Value = value;
        Expiration = expiration;
    }
}