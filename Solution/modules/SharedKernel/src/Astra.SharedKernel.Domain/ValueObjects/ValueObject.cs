using Astra.SharedKernel.Domain.Interfaces;

namespace Astra.SharedKernel.Domain.ValueObjects;

public abstract class ValueObject : IValueObject
{
    protected abstract IEnumerable<object?> GetEqualityComponents();

    public override bool Equals(object? obj)
    {
        if (obj is null || obj.GetType() != GetType())
            return false;

        var other = (ValueObject)obj;

        return GetEqualityComponents()
            .SequenceEqual(other.GetEqualityComponents());
    }

    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Aggregate(0, HashCode.Combine);
    }

    public static bool operator ==(
        ValueObject? left,
        ValueObject? right)
        => Equals(left, right);

    public static bool operator !=(
        ValueObject? left,
        ValueObject? right)
        => !Equals(left, right);
}