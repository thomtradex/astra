using Astra.SharedKernel.Application.Interfaces;

namespace Astra.SharedKernel.Infrastructure.Clock;

public sealed class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;

    public DateTime Today => DateTime.UtcNow.Date;
}