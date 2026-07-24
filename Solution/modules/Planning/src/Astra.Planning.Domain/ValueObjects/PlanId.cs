using System;

namespace Astra.Planning.Domain.ValueObjects;

public readonly record struct PlanId(Guid Value)
{
    public static PlanId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}