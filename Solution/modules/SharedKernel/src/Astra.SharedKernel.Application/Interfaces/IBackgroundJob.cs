namespace Astra.SharedKernel.Application.Interfaces;

public interface IBackgroundJob
{
    Task ExecuteAsync(
        CancellationToken cancellationToken = default);
}