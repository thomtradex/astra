namespace Astra.SharedKernel.Domain.Clock;

public interface IClock
{
    DateTime UtcNow { get; }

    DateOnly Today { get; }

    TimeOnly Time { get; }
}