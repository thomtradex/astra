namespace Astra.SharedKernel.Domain.Localization;

public static class SupportedCulture
{
    public const string Portuguese = "pt-PT";

    public const string English = "en-US";

    public const string Spanish = "es-ES";

    public const string French = "fr-FR";

    public static readonly IReadOnlyCollection<string> All =
    [
        Portuguese,
        English,
        Spanish,
        French
    ];
}