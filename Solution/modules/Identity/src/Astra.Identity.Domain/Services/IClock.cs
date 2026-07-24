namespace Astra.Identity.Domain.Services;

public interface IClock
{
    DateTime UtcNow { get; }
}