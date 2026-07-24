namespace Astra.SharedKernel.Application.Interfaces;

public interface IClock
{
    DateTime UtcNow { get; }

    DateTime Today { get; }
}