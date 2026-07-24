namespace Astra.Identity.Domain.ValueObjects;

public sealed record FullName
{
    public string Value { get; }

    public FullName(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Name is required.");

        Value = value.Trim();
    }

    public override string ToString() => Value;
}