using Astra.SharedKernel.Domain.ValueObjects;

namespace Astra.Identity.Domain.ValueObjects;

public sealed class PermissionName : ValueObject
{
    private PermissionName()
    {
        Value = string.Empty;
    }

    public PermissionName(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);

        Value = value.Trim();
    }

    public string Value { get; }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString()
    {
        return Value;
    }

    public static implicit operator string(PermissionName permission)
        => permission.Value;
}