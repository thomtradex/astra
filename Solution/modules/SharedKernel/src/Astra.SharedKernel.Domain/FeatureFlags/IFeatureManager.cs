namespace Astra.SharedKernel.Domain.FeatureFlags;

public interface IFeatureManager
{
    Task<bool> IsEnabledAsync(
        string featureName,
        CancellationToken cancellationToken = default);
}