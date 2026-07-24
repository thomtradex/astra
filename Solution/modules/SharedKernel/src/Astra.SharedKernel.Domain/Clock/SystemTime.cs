namespace Astra.SharedKernel.Domain.Clock;

public static class SystemTime
{
    public static DateTime UtcNow
        => DateTime.UtcNow;

    public static DateOnly Today
        => DateOnly.FromDateTime(DateTime.UtcNow);

    public static TimeOnly Time
        => TimeOnly.FromDateTime(DateTime.UtcNow);
}