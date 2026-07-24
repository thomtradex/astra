namespace Astra.SharedKernel.Domain.Localization;

public interface ILocalizationProvider
{
    string GetString(
        string key,
        string culture);

    string GetString(
        string key);
}