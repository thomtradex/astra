using System;

namespace Astra.Policy.Domain.ValueObjects;

public readonly record struct PolicyId(Guid Value)
{
    public static PolicyId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}
