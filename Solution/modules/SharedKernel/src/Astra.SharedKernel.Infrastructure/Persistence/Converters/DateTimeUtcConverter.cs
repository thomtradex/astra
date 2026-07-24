using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Astra.SharedKernel.Infrastructure.Persistence.Converters;

public sealed class DateTimeUtcConverter
    : ValueConverter<DateTime, DateTime>
{
    public DateTimeUtcConverter()
        : base(
            value => value.ToUniversalTime(),
            value => DateTime.SpecifyKind(
                value,
                DateTimeKind.Utc))
    {
    }
}