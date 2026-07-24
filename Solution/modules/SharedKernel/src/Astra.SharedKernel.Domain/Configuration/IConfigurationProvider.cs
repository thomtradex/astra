namespace Astra.SharedKernel.Domain.Configuration;

public interface IConfigurationProvider
{
    T Get<T>(
        string key);

    T? GetOrDefault<T>(
        string key);

    bool Exists(
        string key);
}