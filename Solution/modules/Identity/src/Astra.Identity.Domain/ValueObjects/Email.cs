using Astra.SharedKernel.Domain.ValueObjects;

namespace Astra.Identity.Domain.ValueObjects;

public sealed class Email : ValueObject
{
    private Email()
    {
        Value = string.Empty;
    }

    public Email(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);

        value = value.Trim().ToLowerInvariant();

        if (!value.Contains('@'))
            throw new ArgumentException("Invalid email.");

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