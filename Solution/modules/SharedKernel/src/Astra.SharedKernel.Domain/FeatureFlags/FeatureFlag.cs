namespace Astra.SharedKernel.Domain.FeatureFlags;

public sealed record FeatureFlag(
    string Name,
    bool Enabled);