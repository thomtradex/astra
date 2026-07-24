namespace Astra.SharedKernel.Infrastructure.BackgroundJobs;

public interface IBackgroundJobScheduler
{
    Task EnqueueAsync<TJob>(
        CancellationToken cancellationToken = default)
        where TJob : IBackgroundJob;
}