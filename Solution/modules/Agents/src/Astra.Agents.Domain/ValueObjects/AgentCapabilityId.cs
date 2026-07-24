using System;

namespace Astra.Agents.Domain.ValueObjects;

public readonly record struct AgentCapabilityId(Guid Value)
{
    public static AgentCapabilityId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}