namespace Astra.SharedKernel.Infrastructure.BackgroundJobs;

public sealed class InMemoryBackgroundJobScheduler
    : IBackgroundJobScheduler
{
    public Task EnqueueAsync<TJob>(
        CancellationToken cancellationToken = default)
        where TJob : IBackgroundJob
    {
        return Task.CompletedTask;
    }
}