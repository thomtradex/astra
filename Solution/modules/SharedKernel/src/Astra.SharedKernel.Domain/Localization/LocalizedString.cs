namespace Astra.SharedKernel.Domain.Localization;

public sealed record LocalizedString(
    string Key,
    string Value,
    string Culture);