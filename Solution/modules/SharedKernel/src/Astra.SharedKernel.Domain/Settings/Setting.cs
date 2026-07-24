namespace Astra.SharedKernel.Domain.Settings;

public sealed record Setting(
    string Key,
    string Value,
    SettingScope Scope);