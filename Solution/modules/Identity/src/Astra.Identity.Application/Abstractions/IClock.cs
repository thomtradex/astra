namespace Astra.Identity.Application.Abstractions;

public interface IClock
{
    DateTime UtcNow { get; }
}