namespace Astra.SharedKernel.Infrastructure.EventBus;

public sealed class EventBusOptions
{
    public int MaxRetryCount { get; init; } = 3;

    public int RetryDelayMilliseconds { get; init; } = 500;
}