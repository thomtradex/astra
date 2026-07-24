using Astra.SharedKernel.Domain.ValueObjects;

namespace Astra.Identity.Domain.ValueObjects;

public sealed class PasswordHash : ValueObject
{
    private PasswordHash()
    {
        Value = string.Empty;
    }

    public PasswordHash(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);

        Value = value;
    }

    public string Value { get; }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
        => Value;
}