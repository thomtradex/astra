namespace Astra.SharedKernel.Application.Interfaces;

public interface IBackgroundJobScheduler
{
    Task EnqueueAsync<TJob>(
        CancellationToken cancellationToken = default)
        where TJob : IBackgroundJob;

    Task ScheduleAsync<TJob>(
        TimeSpan delay,
        CancellationToken cancellationToken = default)
        where TJob : IBackgroundJob;
}