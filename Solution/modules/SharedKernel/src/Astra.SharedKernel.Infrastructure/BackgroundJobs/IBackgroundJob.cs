namespace Astra.SharedKernel.Infrastructure.BackgroundJobs;

public interface IBackgroundJob
{
    Task ExecuteAsync(
        CancellationToken cancellationToken = default);
}