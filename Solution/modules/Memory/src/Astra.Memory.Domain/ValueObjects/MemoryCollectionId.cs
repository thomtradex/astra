using System;

namespace Astra.Memory.Domain.ValueObjects;

public readonly record struct MemoryCollectionId(Guid Value)
{
    public static MemoryCollectionId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}