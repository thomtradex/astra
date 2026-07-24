using System;

namespace Astra.Memory.Domain.ValueObjects;

public readonly record struct MemoryEntryId(Guid Value)
{
    public static MemoryEntryId New()
        => new(Guid.NewGuid());

    public override string ToString()
        => Value.ToString();
}