using System;

namespace Astra.Projects.Domain.ValueObjects;

public readonly record struct ProjectId(Guid Value)
{
    public static ProjectId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}