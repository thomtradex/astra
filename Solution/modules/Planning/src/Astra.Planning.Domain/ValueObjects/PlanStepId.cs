using System;

namespace Astra.Planning.Domain.ValueObjects;

public readonly record struct PlanStepId(Guid Value)
{
    public static PlanStepId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}